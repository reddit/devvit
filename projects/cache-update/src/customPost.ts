import { Post } from '@devvit/public-api/apis/reddit/models/Post.js';
import { Devvit, RichTextBuilder } from '@devvit/public-api';
import * as BlocksReconciler from '@devvit/public-api/devvit/internals/blocks/BlocksReconciler.js';
import * as b64 from 'base64-js';
import Context = Devvit.Context;
import {
  Block,
  CustomPostDefinition,
  Definition,
  LinkedBundle,
  UIEventHandlerDefinition,
} from '@devvit/protos';

export const createCustomPost = async (
  context: Context,
  title: string,
  ui: JSX.Element
): Promise<Post> => {
  const subredditName = (await context.reddit.getCurrentSubreddit()).name;
  const preview = ui;
  return await context.reddit.submitPost({
    subredditName,
    title,
    preview,
  });
};

export const updateCustomPost = async (
  context: Context,
  postId: string,
  ui: JSX.ComponentFunction
): Promise<boolean> => {
  const post = await context.reddit.getPostById(postId);

  // Get skinny bundle from post
  const matches = new RegExp(/DX_Bundle:\n\n {4}(?<bundle>[^\n]*)/g).exec(post.body ?? '');
  if (!matches || !matches.groups || !matches.groups['bundle']) {
    console.log(`Couldn't find bundle in post ${postId}. Giving up. Selftext:`, post.body);
    return false;
  }

  const origBundle = b64.toByteArray(matches.groups['bundle']);
  const myBundle = LinkedBundle.decode(origBundle);
  // Ensure we have all the correct definitions
  myBundle.provides = [CustomPostDefinition, UIEventHandlerDefinition].map((d) =>
    Definition.toSerializable(d)
  );
  const newBundle = b64.fromByteArray(LinkedBundle.encode(myBundle).finish());

  const reconciler = new (BlocksReconciler as any).BlocksReconciler(ui, undefined, undefined, {
    'devvit-subreddit': { values: [''] },
    'devvit-app-user': { values: [''] },
  });

  const block = (await reconciler.buildBlocksUI()) as Block;
  const cached = b64.fromByteArray(Block.encode(block).finish());

  console.log(`Updating post ${postId} with new cached content:`);
  console.log(cached);

  await post.edit({
    richtext: new RichTextBuilder()
      .heading({ level: 1 }, (h) => h.rawText('DX_Bundle:'))
      .codeBlock({ language: '' }, (c) => {
        c.rawText(newBundle);
      })
      .heading({ level: 1 }, (h) => h.rawText('DX_Config:'))
      .codeBlock({ language: '' }, (c) => {
        c.rawText('EgA=');
      })
      .heading({ level: 1 }, (h) => h.rawText('DX_Cached:'))
      .codeBlock({ language: '' }, (c) => {
        c.rawText(cached);
      }),
  });

  return true;
};
