import type { Context, Post } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';
import type { PostData } from '../types/PostData.js';
import { Drawing } from './Drawing.js';
import { DrawingAnnotation } from './DrawingAnnotation.js';
import { StyledButton } from './StyledButton.js';
import { PointsPill } from './PointsPill.js';
import { PixelText } from './PixelText.js';
import { Service } from '../service/Service.js';
import type { Page } from '../types/Page.js';

interface OverviewPageProps {
  setPage: (page: Page) => void;
  dailyDrawings: PostData[];
  startCardDrawTimer: () => void;
  username: string | null;
}

export const OverviewPage = (props: OverviewPageProps, context: Context): JSX.Element => {
  const { setPage, dailyDrawings, startCardDrawTimer, username } = props;
  const { data: scoreBoardUser } = useAsync(
    async () => {
      const service = new Service(context.redis);

      return username ? await service.getScoreBoardUserEntry(username) : null;
    },
    {
      depends: username,
    }
  );

  const { reddit, ui } = context;

  const tileSize = 83.5;
  const dailyDrawingAttempts = 3;
  const dailyDrawingsLeft = dailyDrawingAttempts - dailyDrawings.length;

  const myDrawings: JSX.Element[] = dailyDrawings.map((drawing) => {
    const isPublished = drawing.published;
    return (
      <DrawingAnnotation word={isPublished ? drawing.word : 'Canceled'}>
        <zstack alignment="center middle">
          <Drawing
            size={tileSize}
            data={drawing.data}
            onPress={
              isPublished
                ? async () => {
                    ui.showToast('Navigating to post');
                    // Non-null assertion as post must have been published to get a postId
                    const post: Post = await reddit.getPostById(drawing.postId!);
                    ui.navigateTo(post);
                  }
                : undefined
            }
          />
          {!isPublished ?? <icon size="large" color="black" name="lock-fill" />}
        </zstack>
      </DrawingAnnotation>
    );
  });

  for (let i = 0; i < dailyDrawingsLeft; i++) {
    const isFirstEmpty = i === 0;
    myDrawings.push(
      <vstack>
        <spacer size="xsmall" />
        <hstack>
          <spacer size="xsmall" />
          <hstack
            height={`${tileSize - 4}px`}
            width={`${tileSize - 4}px`}
            backgroundColor="rgba(0,0,0,0.2)"
            alignment="center middle"
            onPress={
              isFirstEmpty
                ? async () => {
                    const service = new Service(context.redis);
                    const drawingsLeft = await service.getDailyDrawingsLeft(username);
                    if (drawingsLeft <= 0) {
                      ui.showToast('No drawings left today');
                    } else {
                      setPage('card-draw');
                      startCardDrawTimer();
                    }
                  }
                : undefined
            }
          >
            {isFirstEmpty && (
              <image
                imageHeight="40px"
                imageWidth="40px"
                height="40px"
                width="40px"
                description="Add"
                resizeMode="fill"
                url={`data:image/svg+xml,
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M38 18H22V2H18V18H2V22H18V38H22V22H38V18Z"
                      fill="black"
                    />
                  </svg>
                `}
              />
            )}
          </hstack>
        </hstack>
      </vstack>
    );
  }

  return (
    <vstack width="100%" height="100%" alignment="center" padding="large" gap="large">
      {/* Header */}
      <hstack width="100%" alignment="end middle">
        <PointsPill value={scoreBoardUser?.score ?? 0} />
      </hstack>

      <spacer grow />

      <vstack gap="large" width="100%" alignment="center">
        <vstack width="100%" alignment="center" gap="small">
          <PixelText scale={3}>My drawings</PixelText>
          <PixelText scale={2}>Max 3x per day</PixelText>
        </vstack>

        <hstack gap="small">{myDrawings}</hstack>
      </vstack>

      <spacer grow />

      <hstack width="100%" alignment="center">
        <StyledButton width="131px" label="INFO" onPress={() => setPage('info')} />
        <spacer size="small" />
        <StyledButton width="131px" label="SCORES" onPress={() => setPage('leaderboard')} />
      </hstack>
    </vstack>
  );
};
