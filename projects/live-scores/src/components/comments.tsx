import { Devvit, TriggerContext } from '@devvit/public-api';

export function CommentBlock({
  username,
  commentBody,
}: {
  username: string;
  commentBody: string;
}): JSX.Element {
  if (username == 'none') return;
  return (
    <vstack width="100%" height="100%" alignment="bottom">
      <vstack reverse padding="medium">
        <hstack
          height={10}
          padding="small"
          backgroundColor="white"
          alignment="middle start"
          border="thick"
          cornerRadius="full"
        >
          <text size="small" color="black" weight="bold">
            u/{username}:
          </text>
          <spacer></spacer>
          <text size="small" color="black">
            {commentBody}
          </text>
        </hstack>
      </vstack>
    </vstack>
  );
}

export async function getLastComment(
  context: Devvit.Context,
  postId: string | undefined
): Promise<CommentData | undefined> {
  const last = await context.kvStore.get(keyForPostId(postId));
  return last === undefined ? last : (last as unknown as CommentData);
}

export type CommentData = {
  id: string;
  username: string;
  text: string;
  postId: string;
};

export function basicDisplayStringForComment(comment: CommentData): string {
  if (comment.id == `loading`) {
    return ``;
  }
  return `u/${comment.username}: ${comment.text}`;
}

function keyForPostId(postId: string | undefined): string {
  return `lastComment-${postId}`;
}

async function storeLastComment(context: TriggerContext, commentData: CommentData): Promise<void> {
  await context.kvStore.put(keyForPostId(commentData.postId), commentData);
}

Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    // console.log(`CommentCreate context ${JSON.stringify(context)}`);
    // console.log(`CommentCreate event ${JSON.stringify(event)}`);
    if (event.comment && event.author && event.post && event.comment?.parentId[0] != 't') {
      const commentData: CommentData = {
        id: event.comment?.id,
        username: event.author?.name,
        text: event.comment?.body,
        postId: event.post?.id,
      };
      await storeLastComment(context, commentData);
      console.log(`Last Comment Updated! ${commentData.username} : ${commentData.text}`);
    } else {
      console.log(`Invalid Comment ${event.comment?.id} on post ${event.post?.id}`);
    }
  },
});
