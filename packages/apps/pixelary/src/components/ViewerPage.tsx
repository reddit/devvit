import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';
import { Drawing } from './Drawing.js';
import type { PostData } from '../types/PostData.js';
import Settings from '../settings.json';
import { formatDuration } from '../utils/formatDuration.js';
import { StyledButton } from './StyledButton.js';
import { getScoreMultiplier } from '../utils/getScoreMultiplier.js';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PointsToast } from './PointsToast.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import { Service } from '../service/Service.js';
import type { Page } from '../types/Page.js';

interface ViewerPageProps {
  setPage: (page: Page) => void;
  postData: PostData;
  showFeedback: boolean;
  pointsEarned: number;
  isSolved: boolean;
  isAuthor: boolean;
  username: string | null;
  heroPostId?: string;
  onValidateGuess: (guess: string) => Promise<void>;
  canDraw: boolean;
}

export const ViewerPage = (props: ViewerPageProps, context: Context): JSX.Element => {
  const {
    setPage,
    onValidateGuess,
    postData,
    showFeedback,
    pointsEarned,
    isSolved,
    isAuthor,
    username,
    heroPostId,
    canDraw,
  } = props;
  const { ui } = context;
  const { word, data, date, expired = false }: PostData = postData;

  /*
   * Guess form
   */

  const guessForm = useForm(
    {
      title: 'Guess the word',
      acceptLabel: 'Guess',
      fields: [
        {
          type: 'string',
          name: 'guess',
          label: 'Word',
          helpText: 'A single, case insensitive word',
          required: true,
        },
      ],
    },
    async (values) => {
      const guess = values.guess.trim();
      await onValidateGuess(guess);
    }
  );

  const isSolvedByUser = pointsEarned > 0;

  const timeLeft = date + Settings.postLiveSpan - Date.now();
  const scoreMultiplier = getScoreMultiplier(Date.now());
  const points = Settings.guesserPoints * scoreMultiplier;

  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={1024}
        imageWidth={1500}
        height="100%"
        width="100%"
        url="background.png"
        description="striped blue background"
        resizeMode="cover"
      />
      <vstack width="100%" height="100%" padding="large" alignment="center middle">
        {/* Time left */}
        <hstack gap="small">
          <PixelSymbol type="clock" />
          <PixelText>{expired ? 'Ended' : `${formatDuration(timeLeft)} left`}</PixelText>
        </hstack>

        <spacer size="small" />
        <spacer size="medium" />

        <zstack alignment="center middle" height="279px" width="279px">
          <Drawing data={data} />
          {showFeedback && !isSolvedByUser && (
            <image
              url={'feedback-incorrect.png'}
              imageHeight={512}
              imageWidth={512}
              height="256px"
              width="256px"
            />
          )}
          {showFeedback && isSolvedByUser && <PointsToast value={pointsEarned} />}
        </zstack>

        <spacer size="large" grow />

        {!expired && !isSolvedByUser && !isAuthor && (
          <vstack alignment="center">
            <StyledButton
              width="275px"
              label="GUESS THE WORD"
              onPress={() => ui.showForm(guessForm)}
            />
            <spacer size="medium" />
          </vstack>
        )}

        {(isAuthor || expired || isSolvedByUser) && (
          <vstack>
            <PixelText scale={3}>{word}</PixelText>
            <spacer size="xsmall" />
          </vstack>
        )}

        {isAuthor && !isSolved && (
          <vstack>
            <PixelText>You drew this!</PixelText>
          </vstack>
        )}

        {!expired && !isAuthor && !isSolvedByUser && (
          <hstack gap="small">
            <PixelText>{`For ${formatNumberWithCommas(points)}`}</PixelText>
            <PixelSymbol type="star" />
            <PixelText>{` (${scoreMultiplier}x)`}</PixelText>
          </hstack>
        )}

        {!isAuthor && isSolvedByUser && (
          <hstack gap="small">
            <PixelText>Earned</PixelText>
            <PixelText>{formatNumberWithCommas(pointsEarned)}</PixelText>
            <PixelSymbol type="star" />
          </hstack>
        )}

        {isAuthor && isSolved && (
          <hstack gap="small">
            <PixelText>Earned</PixelText>
            <PixelText>{formatNumberWithCommas(Settings.drawerPoints)}</PixelText>
            <PixelSymbol type="star" />
          </hstack>
        )}

        {(expired || isAuthor || isSolvedByUser) && (
          <vstack>
            <spacer size="small" />
            <spacer size="medium" />
            <hstack width="100%" alignment="center">
              <StyledButton
                width={canDraw ? '131px' : '275px'}
                label="SCORES"
                onPress={() => setPage('leaderboard')}
              />
              {canDraw && (
                <>
                  <spacer size="small" />
                  <StyledButton
                    width="131px"
                    label="DRAW"
                    onPress={async () => {
                      const service = new Service(context.redis);
                      const [drawingsLeft, Post] = await Promise.all([
                        await service.getDailyDrawingsLeft(username),
                        await context.reddit.getPostById(heroPostId!),
                      ]);

                      if (drawingsLeft <= 0) {
                        ui.showToast('No drawings left today');
                      } else {
                        ui.navigateTo(Post);
                      }
                    }}
                  />
                </>
              )}
            </hstack>
          </vstack>
        )}
      </vstack>
    </zstack>
  );
};
