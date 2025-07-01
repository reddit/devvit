# The World's Largest Hackathon

Welcome to everyone participating in the World’s Largest Hackathon by Bolt!

[![Hackathon Logo](./assets/ai-tools/hackathon-logo.png)](https://hackathon.dev)

Reddit is proud to sponsor the Silly Sh!t challenge in the Hackathon where we celebrate the whimsical, the bizarre, and the hilariously impractical projects that serve no real purpose but bring maximum joy.

Devvit, or Reddit’s Developer Platform, allows you to build games and apps that run in Reddit. Take a look at some high quality games such as [Riddonkulous](https://www.reddit.com/r/riddonkulous/), [BuildIt](https://www.reddit.com/r/buildit/) and [Ducky Dash](https://www.reddit.com/r/RedditGames/comments/1l2vq3t/daily_challenge_ducky_dash_june_4_2025/).

But for this challenge you are not limited to high quality games. You can use Bolt to vibe code your way to **something silly** that has no reason to exist, and serves no purpose except to be fun.

Visit our [AI Tools section](devvit_web/ai_tools.mdx) for more information on how to use our [Bolt Template](https://github.com/reddit/devvit-bolt-starter-experimental)

<iframe
  width="800px"
  height="400px"
  src="https://www.youtube.com/embed/uI85NRCoQNU"
  title="Using the Bolt x Devvit template"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>

Even after the hackathon, you can still earn money with your Devvit project. Visit our [Reddit Developer Funds](reddit_developer_funds.md) page for more information on how you can earn money from your Devvit app or game. This program currently allow developers to get paid as apps achieve certain usage metrics, **with payments up to $116,500+ per app**

We hope you have fun with the challenge!

If you have any question [Join our Discord](https://discord.gg/Cd43ExtEFS) and ask questions in **#devvit-vibe-coding**.

### Frequently Asked Questions (FAQ)

**Q: What are the requirements for submitting to this hackathon?**

In addition to all the [general submission requirements](https://worldslargesthackathon.devpost.com/resources#silly-sh-t-challenge), users submitting for this category must submit:

- **Required** Demo Post: include a link to your a) test subreddit b) a post running your game. Please make sure your subreddit is public, OR you can install [this app](https://developers.reddit.com/apps/dr-admin-approve) into your subreddit to allow our team to join automatically.
- **Required** Reddit username.

The Reddit judges will be looking at the Reddit link to the demo post to evaluate submissions.

**Q: How are you judging the submissions for the Silly Sh\!t challenge?**  
This category celebrates the whimsical, the bizarre, and the hilariously impractical i.e. projects that serve no real purpose but bring maximum joy. The kind of content that makes you upvote without knowing why.

No one appreciates odd, irreverent, andfun quite like redditors. That’s why Reddit and Bolt are encouraging developers to let loose, get weird, and showcase their most gloriously silly ideas. In addition to cash prizes, winners will receive a Reddit trophy, internet glory, and of course—bragging rights for having built the most silly app.

We'll be looking for a combination of delightful UX, an amazingly absurd concept, and native to reddit (i.e. fully ported into a Reddit custom post unit, bonus points for leveraging things like Reddit flair). r/GamesOnReddit is a great place to look for inspiration.

We’d encourage you to test on mobile, but it is not a requirement. The Reddit judges will be looking at the Reddit link to the demo post to evaluate submissions.

**Q: What if I get a rpc error within the playtest subreddit post?**

Try with the latest [template](https://github.com/reddit/devvit-bolt-starter-experimental). The `devvit` package should be on `0.11.17`, but the @devvit packages (`@devvit/public-api`, `@devvit/client`, `@devvit/server`, etc) should be on `0.11.16`.
Example

```js
/// package.json

"dependencies": {
    "@devvit/client": "0.11.16",
    "@devvit/public-api": "0.11.16",
    "@devvit/redis": "0.11.16",
    "@devvit/server": "0.11.16",
    "devvit": "0.11.17",
    // ... other dependencies
  },
```

**Q: I’m getting an error when using Safari or iOS, but not on chrome.**

We are currently fixing an issue where Safari and iOS are getting network errors on API requests. Please run a new playtest or upload (npm run dev) and it should resolve this.

**Q: My new username or development subreddit was banned.**

Please reach out to our team at [devvit-support@reddit.com](mailto:devvit-support@reddit.com) or via our Discord server [here](https://discord.gg/Cd43ExtEFS).
