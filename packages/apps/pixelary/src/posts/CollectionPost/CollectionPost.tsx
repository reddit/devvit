import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';

import { PaginatedDrawings } from '../../components/PaginatedDrawings.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import Settings from '../../settings.json';
import type { CollectionPostData } from '../../types/PostData.js';

export const CollectionPost = (
  props: {
    collection: CollectionPostData;
  },
  context: Context
): JSX.Element => {
  if (!props.collection) {
    throw 'CollectionPost: No collection data provided';
  }

  const { data, loading } = useAsync<string>(async () => {
    const post = await context.reddit.getPostById(props.collection.data[0].postId);
    return post.permalink;
  });

  return (
    <vstack width="100%" height="100%" alignment="center">
      <spacer height="24px" />
      <PixelText scale={3}>Top drawings</PixelText>
      <spacer height="4px" />
      <PixelText scale={2} color={Settings.theme.secondary}>
        {`from the last ${props.collection.timeframe}`}
      </PixelText>
      <spacer height="16px" />
      <PaginatedDrawings
        drawings={props.collection.data}
        drawingsPerRow={2}
        tileSize={144}
        ctaButtonEl={
          <StyledButton
            label="PLAY PIXELARY"
            onPress={() => {
              // Fallback to Pixelary subreddit if permalink is not available
              const permalink = loading ? '/r/Pixelary' : data;
              context.ui.navigateTo(`https://www.reddit.com${permalink}`);
            }}
            width="295px"
          />
        }
      ></PaginatedDrawings>
    </vstack>
  );
};
