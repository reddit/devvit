import { Context, Devvit } from '@devvit/public-api';
import { DailyDrawingRecord } from '../../types/DailyDrawingRecord.js';
import { Drawing } from '../../components/Drawing.js';
import { DrawingAnnotation } from '../../components/DrawingAnnotation.js';
import { StyledButton } from '../../components/StyledButton.js';
import { PointsPill } from '../../components/PointsPill.js';
import { PixelText } from '../../components/PixelText.js';
import { editorPages } from './editorPages.js';

interface OverviewPageProps {
  setPage: (page: editorPages) => void;
  dailyDrawings: DailyDrawingRecord[];
  userPoints: number;
  startCardDrawTimer: () => void;
}

export const OverviewPage = async (
  props: OverviewPageProps,
  context: Context
): Promise<JSX.SyncElement> => {
  const { setPage, dailyDrawings, userPoints, startCardDrawTimer } = props;
  const { reddit, ui } = context;

  const firstNullIndex = dailyDrawings.findIndex((drawing) => drawing === null);
  const tileSize = 83.5;
  const tileSizeInPixels = `${tileSize}px`;

  const myDrawings = await Promise.all(
    dailyDrawings.map(async (drawing, index) => {
      const isFirstNullIndex = index === firstNullIndex;

      if (drawing !== null && drawing !== false) {
        const post = await reddit.getPostById(drawing.postId);
        return (
          <DrawingAnnotation word={drawing.word}>
            <Drawing size={tileSize} data={drawing.data} onPress={() => ui.navigateTo(post)} />
          </DrawingAnnotation>
        );
      }

      if (drawing === false) {
        return (
          <DrawingAnnotation word="Cancelled">
            <hstack
              height={tileSizeInPixels}
              width={tileSizeInPixels}
              cornerRadius="small"
              backgroundColor="rgba(255,255,255,0.3)"
              alignment="center middle"
            >
              <icon size="large" color="black" name="lock-fill" />
            </hstack>
          </DrawingAnnotation>
        );
      }

      if (drawing === null) {
        return (
          <hstack
            height={tileSizeInPixels}
            width={tileSizeInPixels}
            cornerRadius="small"
            backgroundColor="rgba(255,255,255,0.3)"
            alignment="center middle"
            onPress={
              isFirstNullIndex
                ? () => {
                    setPage('card-draw');
                    startCardDrawTimer();
                  }
                : undefined
            }
          >
            {isFirstNullIndex && <icon size="large" color="black" name="add-fill" />}
          </hstack>
        );
      }
    })
  );

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
