import type { Context, Post } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import type { PostData } from '../../types/PostData.js';
import { Drawing } from '../../components/Drawing.js';
import { DrawingAnnotation } from '../../components/DrawingAnnotation.js';
import { StyledButton } from '../../components/StyledButton.js';
import { PointsPill } from '../../components/PointsPill.js';
import { PixelText } from '../../components/PixelText.js';
import type { editorPages } from './editorPages.js';

interface OverviewPageProps {
  setPage: (page: editorPages) => void;
  dailyDrawings: PostData[];
  userPoints: number;
  startCardDrawTimer: () => void;
}

export const OverviewPage = (props: OverviewPageProps, context: Context): JSX.Element => {
  const { setPage, dailyDrawings, userPoints, startCardDrawTimer } = props;
  const { reddit, ui } = context;

  const tileSize = 83.5;
  const tileSizeInPixels = `${tileSize}px`;
  const dailyDrawingAttemps = 3;
  const dailyDrawingsLeft = dailyDrawingAttemps - dailyDrawings.length;

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
      <hstack
        height={tileSizeInPixels}
        width={tileSizeInPixels}
        cornerRadius="small"
        backgroundColor="rgba(255,255,255,0.3)"
        alignment="center middle"
        onPress={
          isFirstEmpty
            ? () => {
                setPage('card-draw');
                startCardDrawTimer();
              }
            : undefined
        }
      >
        {isFirstEmpty && <icon size="large" color="black" name="add-fill" />}
      </hstack>
    );
  }

  return (
    <vstack width="100%" height="100%" alignment="center" padding="large" gap="large">
      {/* Header */}
      <hstack width="100%" alignment="end middle">
        <PointsPill value={userPoints} />
      </hstack>

      <spacer grow />

      <vstack gap="large" width="100%" alignment="center">
        <vstack width="100%" alignment="center" gap="small">
          <PixelText scale={3}>My drawings</PixelText>
          <PixelText scale={2}>3x drawings per day</PixelText>
        </vstack>

        <hstack gap="small">{myDrawings}</hstack>
      </vstack>

      <spacer grow />

      <hstack width="100%" alignment="center">
        <StyledButton width="131px" label="INFO" onPress={() => setPage('how-to-play')} />
        <spacer size="small" />
        <StyledButton width="131px" label="SCORES" onPress={() => setPage('leaderboard')} />
      </hstack>
    </vstack>
  );
};
