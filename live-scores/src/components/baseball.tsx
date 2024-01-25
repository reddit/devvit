import { Devvit } from '@devvit/public-api';
import { BaseballGameScoreInfo, InningState } from '../sports/espn/espn.js';
import { TeamBlock } from './TeamBlock.js';
import { TopBar } from './TopBar.js';
import { CommentData, CommentBlock } from './comments.js';
import { EventState, leagueAssetPath } from '../sports/GameEvent.js';

export type TeamBlockBaseball = {
  isPitching: boolean;
  activePlayer: string;
  isDueUp: boolean;
  playerSummary: string;
};

export function BaseballScoreBoard(
  scoreInfo: BaseballGameScoreInfo,
  lastComment: CommentData,
  demoNext: () => void | Promise<void>
): JSX.Element {
  return (
    <blocks height="regular">
      <vstack cornerRadius="medium" grow>
        {TopBar({
          baseballProps: {
            inningState: scoreInfo.inningState,
            inning: scoreInfo.inning,
            balls: scoreInfo.balls,
            strikes: scoreInfo.strikes,
            outs: scoreInfo.outs,
            isRunnerOnFirst: scoreInfo.isRunnerOnFirst,
            isRunnerOnSecond: scoreInfo.isRunnerOnSecond,
            isRunnerOnThird: scoreInfo.isRunnerOnThird,
          },
          event: scoreInfo.event,
          isOnline: true,
        })}
        <zstack grow width={100}>
          <vstack width={'100%'} height={'100%'}>
            {TeamBlock({
              isHomeTeam: false,
              name: scoreInfo.event.awayTeam.fullName,
              logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.awayTeam.logo,
              score: scoreInfo.awayScore,
              state: scoreInfo.event.state,
              baseballProps: {
                isPitching:
                  scoreInfo.inningState === InningState.BOTTOM ||
                  scoreInfo.inningState === InningState.MID,
                playerSummary:
                  scoreInfo.inningState === InningState.BOTTOM ||
                  scoreInfo.inningState === InningState.MID
                    ? scoreInfo.pitcherSummery
                    : scoreInfo.batterSummary,
                activePlayer:
                  scoreInfo.inningState === InningState.TOP
                    ? scoreInfo.batter
                    : scoreInfo.inningState === InningState.MID
                    ? ''
                    : scoreInfo.inningState === InningState.END
                    ? scoreInfo.dueUp
                    : scoreInfo.pitcher,
                isDueUp: scoreInfo.inningState === InningState.END,
              },
            })}
            {TeamBlock({
              isHomeTeam: true,
              name: scoreInfo.event.homeTeam.fullName,
              logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.homeTeam.logo,
              score: scoreInfo.homeScore,
              state: scoreInfo.event.state,
              baseballProps: {
                isPitching:
                  scoreInfo.inningState === InningState.TOP ||
                  scoreInfo.inningState === InningState.END,
                playerSummary:
                  scoreInfo.inningState === InningState.TOP ||
                  scoreInfo.inningState === InningState.END
                    ? scoreInfo.pitcherSummery
                    : scoreInfo.batterSummary,
                activePlayer:
                  scoreInfo.inningState === InningState.TOP
                    ? scoreInfo.pitcher
                    : scoreInfo.inningState === InningState.MID
                    ? scoreInfo.dueUp
                    : scoreInfo.inningState === InningState.END
                    ? ''
                    : scoreInfo.batter,
                isDueUp: scoreInfo.inningState === InningState.MID,
              },
            })}
          </vstack>
          {CommentBlock({
            username: lastComment.username,
            commentBody: lastComment.text,
          })}
          {scoreInfo.event.id.startsWith(`demo`) && (
            <hstack width={'100%'} height={'100%'} alignment="end bottom">
              <button maxWidth={100} onPress={() => demoNext()}>
                Next
              </button>
            </hstack>
          )}
        </zstack>
      </vstack>
    </blocks>
  );
}

function Base(
  isRunnerOnFirst: boolean,
  isRunnerOnSecond: boolean,
  isRunnerOnThird: boolean
): JSX.Element {
  const height = 32;
  const width = 32;
  return (
    <zstack>
      <image url="baseball/bases-empty.png" imageHeight={height} imageWidth={width} />
      {isRunnerOnFirst ? (
        <image url="baseball/bases-1b.png" imageHeight={height} imageWidth={width} />
      ) : (
        <></>
      )}
      {isRunnerOnSecond ? (
        <image url="baseball/bases-2b.png" imageHeight={height} imageWidth={width} />
      ) : (
        <></>
      )}
      {isRunnerOnThird ? (
        <image url="baseball/bases-3b.png" imageHeight={height} imageWidth={width} />
      ) : (
        <></>
      )}
    </zstack>
  );
}

function OutDot(isFull: boolean): JSX.Element {
  return (
    <hstack
      padding="xsmall"
      backgroundColor={isFull ? 'white' : 'transparent'}
      borderColor="white"
      border="thin"
      cornerRadius="full"
    />
  );
}

export type TopBarBaseball = {
  inningState: InningState;
  inning: number;
  balls: number;
  strikes: number;
  outs: number;
  isRunnerOnFirst: boolean;
  isRunnerOnSecond: boolean;
  isRunnerOnThird: boolean;
};

export function topBarBaseballComponent(baseballProps: TopBarBaseball): JSX.Element {
  const {
    inningState,
    inning,
    isRunnerOnFirst,
    isRunnerOnSecond,
    isRunnerOnThird,
    outs,
    strikes,
    balls,
  } = baseballProps;

  const isActiveInning = inningState === InningState.BOTTOM || inningState === InningState.TOP;

  return (
    <hstack padding="medium" backgroundColor="black" alignment="center middle">
      {isActiveInning ? (
        <image
          url={
            inningState === InningState.TOP
              ? 'baseball/inning_top.png'
              : 'baseball/inning_bottom.png'
          }
          imageHeight={8}
          imageWidth={8}
        />
      ) : (
        <text color="white" style="heading">
          {inningState === InningState.MID ? 'Mid' : 'End'}
        </text>
      )}
      <spacer size="small" />
      <text color="white" style="heading">
        {inning.toString()}
      </text>
      <spacer size="medium" />
      <vstack alignment="center">
        {Base(isRunnerOnFirst, isRunnerOnSecond, isRunnerOnThird)}
        <hstack gap="small">
          {OutDot(outs > 0)}
          {OutDot(outs > 1)}
          {OutDot(outs > 2)}
        </hstack>
      </vstack>
      <spacer size="medium" />
      <text color="white" style="heading">
        {balls.toString()} - {strikes.toString()}
      </text>
    </hstack>
  );
}

export function sportSpecificContentBaseball(
  state: EventState,
  baseballProps: TeamBlockBaseball
): JSX.Element {
  const { playerSummary, isPitching, isDueUp, activePlayer } = baseballProps;

  const playerSummaryItems = playerSummary.split(', ');
  const playerSummaryItemsFiltered = playerSummaryItems.filter((item) => {
    if (isPitching) return item.includes('IP') || item.includes('K') || item.includes('ER');
    else return true;
  });

  return (
    <>
      {state === EventState.LIVE && isDueUp && <text>Due Up</text>}
      <text size="large" weight="bold">
        {activePlayer}
      </text>
      <text size="small">{playerSummaryItemsFiltered.join(', ')}</text>
    </>
  );
}
