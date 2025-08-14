import { Subreddit } from './Subreddit.js';

test('typing is intuitive', () => {
  const sub = { submitPost() {} } as unknown as Subreddit;
  // SubmitMediaOptions
  sub.submitPost({ title: 'title', kind: 'image' });
  sub.submitPost({ title: 'title', kind: 'image', videoPosterUrl: 'videoPosterUrl' });

  // SubmitLinkOptions
  sub.submitPost({ title: 'title', url: 'url' });
  sub.submitPost({ title: 'title', url: 'url', nsfw: true });

  // SubmitSelfPostOptions
  sub.submitPost({ title: 'title', text: 'text' });

  // @ts-expect-error: only CommonSubmitPostOptions.
  sub.submitPost({ title: 'title', nsfw: true });
  // @ts-expect-error: only CommonSubmitPostOptions.
  sub.submitPost({ title: 'title' });
  // @ts-expect-error: can't mix SubmitMediaOptions and SubmitLinkOptions.
  sub.submitPost({ title: 'title', videoPosterUrl: 'videoPosterUrl', resubmit: true });
  // @ts-expect-error: can't mix SubmitMediaOptions and SubmitSelfPostOptions.
  sub.submitPost({ title: 'title', videoPosterUrl: 'videoPosterUrl', text: 'text' });
  // @ts-expect-error: can't mix SubmitLinkOptions and SubmitSelfPostOptions.
  sub.submitPost({ title: 'title', resubmit: true, text: 'text' });
});

test('subreddit listing data can be used to populate Subreddit constructor', () => {
  // Subreddit from a Listing (like /subreddits/mine/subscriber) come with a subset
  // of the data that the Subreddit constructor expects. Make sure we can create
  // this without error.
  const subreddit = new Subreddit({
    created: 1755202932,
    createdUtc: 1755202932,
    id: 'f6bhb3',
    name: 't5_f6bhb3',
    subredditType: 'private',
    over18: false,
    quarantine: false,
    title: 'r4r_bot_dev',
    url: '/r/r4r_bot_dev/',
    displayName: 'r4r_bot_dev',
  });
  expect(subreddit.name).toBe('r4r_bot_dev');
});
