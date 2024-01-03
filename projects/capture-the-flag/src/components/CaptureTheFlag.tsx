import { Devvit } from '@devvit/public-api';
import { Page } from '../types/page.js';
import { FlagPage } from './FlagPage.js';
import { LeaderboardPage } from './LeaderboardPage.js';
import { InfoPage } from './InfoPage.js';
import { Leaderboard, TournamentState, UserData } from '../types/state.js';
import {
  getLeaderboardState,
  getTournamentState,
  fetchUserData,
  updateScore,
  updateUserData,
  getScoreByName,
  saveTournamentStateSafe,
  getNewUserScore,
  getAutoDropJobId,
} from '../api.js';
import {
  getHoldingDurationMs,
  insertFlagHolderToLeaderboard,
  minutesToMs,
  randomNumber,
} from '../utils.js';
import {
  AUTO_DROP_INTERVAL_MINUTES,
  MAX_COOLDOWN_SECONDS,
  MIN_COOLDOWN_SECONDS,
} from '../config.js';
import { key_post, Keys } from '../keys.js';
import { scheduleAutoDropJob } from '../scheduler.js';

export const CaptureTheFlag: Devvit.CustomPostComponent = (context): JSX.Element => {
  const { useState } = context;
  const [page, setPage] = useState<Page>('flag');
  const [tournamentState, setTournamentState] = useState<TournamentState>(async () => {
    return await getTournamentState(context.redis, context.postId!);
  });

  const [userData, setUserData] = useState<UserData | null>(async () => {
    return await fetchUserData(context.redis, context.reddit, context.postId!, context.userId);
  });

  // workaround for https://reddit.atlassian.net/browse/DXR-853
  const [userId, _setUserId] = useState<string | undefined>(() => {
    return context.userId;
  });

  const [leaderboardState, setLeaderboardState] = useState<Leaderboard>(async () => {
    return await getLeaderboardState(context.redis, context.postId!, userData?.name);
  });

  // TODO update the score on recapture
  const [flagHolderScore, _setFlagHolderScore] = useState<number>(async () => {
    if (!tournamentState.flagHolderName) {
      return 0;
    }
    return await getScoreByName(context.redis, context.postId!, tournamentState.flagHolderName);
  });

  const interval = context.useInterval(async () => {
    const newState = await getTournamentState(context.redis, context.postId!);
    if (tournamentState.holdingSince !== newState.holdingSince || !newState.gameActive) {
      const newLeaderboard = await getLeaderboardState(
        context.redis,
        context.postId!,
        userData?.name
      );
      setLeaderboardState(newLeaderboard);
    }
    setTournamentState(newState);
  }, 1000);

  if (tournamentState.gameActive) {
    interval.start();
  } else {
    interval.stop();
  }

  const claimTheFlag = async () => {
    if (!userData || !userId) {
      console.log('\nIncognito flag capture attempt\n');
      return;
    }
    const attemptTime = Date.now();
    console.log(`\n${userData.name} attempts to capture the flag at ${attemptTime}\n`);
    const trueUserData = await fetchUserData(
      context.redis,
      context.reddit,
      context.postId!,
      userId
    );
    if (!trueUserData || !trueUserData.attemptsRemaining) {
      console.log('wrong user data');
      return;
    }

    const state = await getTournamentState(context.redis, context.postId!);
    if (!state || !state.gameActive) {
      console.log('wrong game state');
      return;
    }

    const lockExpiration = new Date(attemptTime + 1000);
    const lockLey = key_post(Keys.flagCaptureLock, context.postId!);
    const lockAcquired = await context.redis.set(lockLey, 'locked', {
      expiration: lockExpiration,
      nx: true,
    });
    console.log(`lock status for ${trueUserData.name} is ${lockAcquired}`);

    const newAttemptsRemaining = trueUserData.attemptsRemaining - 1;
    const newUserData = { ...trueUserData, attemptsRemaining: newAttemptsRemaining };
    await updateUserData(context.redis, context.postId!, userId, newUserData);
    setUserData(newUserData);

    if (!lockAcquired) {
      console.log(
        `\n${userData.name}'s attempt is unsuccessful because they did not get the lock \n`
      );
      context.ui.showToast(`Too early! ${state.flagHolderName} holds the flag`);
      return;
    }

    const transaction = await context.redis.watch(
      key_post(Keys.tournamentState, context.postId!),
      key_post(Keys.leaderboard, context.postId!)
    );
    await transaction.multi();
    const timeDiffMs = attemptTime - state.holdingSince;
    if (timeDiffMs < 1000 * state.cooldown) {
      // Fail 👎
      console.log(`\n${userData.name}'s attempt is unsuccessful because it's too early\n`);
      context.ui.showToast(`Too early! ${state.flagHolderName} holds the flag`);
      return;
    }

    // Success 👍
    console.log(`\n\n\n=========\n${userData.name} successfully captures the flag!\n`);
    if (state.flagHolderName) {
      const previousAutoDropJobId = await getAutoDropJobId(
        context.redis,
        context.postId!,
        state.flagHolderName
      );
      if (previousAutoDropJobId) {
        console.log(`Cancelling AUTO_DROP job for ${state.flagHolderName}`);
        await context.scheduler.cancelJob(previousAutoDropJobId);
      }
      const newScore = await getNewUserScore(
        context.redis,
        context.postId!,
        state.flagHolderName,
        timeDiffMs
      );
      await updateScore(transaction, context.postId!, state.flagHolderName, newScore);
    }

    const newState: TournamentState = {
      flagHolderName: userData.name,
      holdingSince: attemptTime,
      gameActive: state.gameActive,
      cooldown: randomNumber(MIN_COOLDOWN_SECONDS, MAX_COOLDOWN_SECONDS),
    };
    await saveTournamentStateSafe(transaction, context.postId!, newState);
    const autoDropTime = attemptTime + minutesToMs(AUTO_DROP_INTERVAL_MINUTES);
    await scheduleAutoDropJob(
      transaction,
      context.scheduler,
      context.postId!,
      userData.name,
      autoDropTime
    );
    await transaction.del(lockLey);
    await transaction.exec();
    context.ui.showToast('Flag is yours!');
    console.log('Flag capture execution end \n\n\n');
  };

  const openUserPage = async (username: string) => {
    context.ui.navigateTo(`https://www.reddit.com/user/${username}/`);
  };

  const currentHoldingDurationSec = (Date.now() - tournamentState.holdingSince) / 1000;

  const renderCurrentPage = () => {
    if (page === 'leaderboard' || !tournamentState.gameActive) {
      const liveLeaderboard = tournamentState.flagHolderName
        ? insertFlagHolderToLeaderboard(leaderboardState, {
            name: tournamentState.flagHolderName,
            score: Math.floor(flagHolderScore + currentHoldingDurationSec),
          })
        : leaderboardState;
      return (
        <LeaderboardPage
          setPage={setPage}
          leaderboard={liveLeaderboard!}
          currentUserName={userData?.name}
          gameActive={tournamentState.gameActive}
          openUserPage={openUserPage}
        />
      );
    }

    if (page === 'flag') {
      // true for upper boundary of a cooldown period after capture
      const potentiallyOnCooldown =
        !!tournamentState.flagHolderName && currentHoldingDurationSec <= MAX_COOLDOWN_SECONDS;
      return (
        <FlagPage
          claimant={tournamentState.flagHolderName}
          debug_cooldown={tournamentState.cooldown}
          holdingDurationMs={getHoldingDurationMs(tournamentState.holdingSince)}
          setPage={setPage}
          isOnCooldown={potentiallyOnCooldown}
          isCurrentClaimant={tournamentState.flagHolderName === userData?.name} // true if current user is holding the flag
          claimTheFlag={claimTheFlag}
          attemptsLeft={userData?.attemptsRemaining}
        />
      );
    }

    if (page === 'info') {
      return <InfoPage setPage={setPage} />;
    }
  };

  return (
    <zstack height="100%" width="100%">
      <image
        url="background.png"
        imageHeight={512}
        imageWidth={750}
        width="100%"
        height="100%"
        resizeMode="fill"
      />
      {renderCurrentPage()}
    </zstack>
  );
};
