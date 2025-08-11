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
