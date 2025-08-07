# Launch your app

After you build your app, it’s time to launch it! Feedback from the community is one of the best ways to improve your app. This guide outlines where and how to launch your app based on its type and stage.

| Launch Stage | Games: Where to launch   | Community Apps: Where to launch                            |
| :----------- | :----------------------- | :--------------------------------------------------------- |
| Alpha        | r/Devvit Feedback Friday | r/Devvit Feedback Friday & \#mod-discussion (discord)      |
| Beta         | r/GamesOnReddit          | Test on subreddits you moderate with: `npx devvit publish` |
| GA           | `npx devvit publish`     | `npx devvit publish --listed`                              |

### Games

#### Alpha \- early dev feedback

The alpha stage is for validating your core concept and catching major issues. Post in r/Devvit's "Feedback Friday" to get technical feedback from other developers and Reddit admins.

Launch your game in three steps:

1. Create a public subreddit for your game
2. Create a game post in your public subreddit
3. Cross post on Friday to r/Devvit with the flair “Feedback Friday”

Guidelines:

- Post only once per meaningful update (2+ week gaps)
- Respond to feedback within 24-48 hours
- Test other developers' apps to build relationships

#### Beta \- broader player testing

When you’re ready for redditors to play your game, the best place to launch your game is on r/GamesOnreddit. Once your game is launched in your public subreddit, cross post a game post to r/GamesOnReddit with flair "Feedback”.

Engage with game players that give you feedback and start growing your community. **Apps that have strong post engagement metrics will automatically move to the next launch phase.**

#### GA \- public release and featuring

When you're ready go publically release your game, publish your app with:

`npx devvit upload`, which uploads the latest version of your app
`npx devvit publish`

If your app does well in the Beta, we may automatically publish your app on your behalf. Publishing will trigger a thorough app review. Once approved, your game will be eligible for our featuring mechanisms:

- Games directory
- Home feed distribution
- Featured promotional units

An approved app will automatically be shared with a small number of redditors. If redditors engage with your post (see key engagement metrics) it will be picked up by larger audiences.

Key engagement metrics:

- Contribution generation \- comments and posts created
- Click through rate \- how often users engage with your app
- Dwell time \- how long users spend in your app
- Post score \- upvotes vs downvotes ratio

The most successful games spike in:

1. Generating genuine conversation within each post, and
2. Creating a diverse set of content for redditors (compelling posts)

### Community Apps

Community apps are apps that are built to use within a community, which includes mod tools like Bot Bouncer or interactive post apps like Community Hub. It’s important to get connected with mods since they decide which apps to install in their community.

#### Alpha \- early dev feedback

The alpha stage validates whether your app solves real community problems. Gather feedback through r/Devvit's "Feedback Friday" posts and the \#mod-discussion Discord channel to connect with both developers and experienced moderators.

Your post should explain the problem your app solves, target community types, and how it fits into existing mod workflows. Include screenshots of the mod interface and configuration options.

Guidelines:

- Test with different permission levels (mod, approved user, regular user)
- Post only once per meaningful update (2+ week gaps)
- Actively seek feedback from mods of your target communities

#### Beta \- actual subreddit testing

Once you’ve received feedback it’s time to test your app in a larger subreddit. If you’re a mod of a subreddit you can publish your app as unlisted:

`npx devvit upload`, which uploads the latest version of your app
`npx devvit publish`

Once approved, your app will not show up in the app store, but you can install the app to any large subreddit that you moderate.

#### GA \- public release to the app store

Once you’re ready to launch, you’ll need to publish to our app store so any mod can install your app. You can do this by running `npx devvit publish --listed`. Once approved, your app will be installable by any mod and visible for others to see in the app store.

### Additional resources

- If you have questions join our Discord or post in [r/Devvit](https://reddit.com/r/devvit).
- Review our [rules](../../devvit_rules.md) before publishing
- Learn more about [earning money](../../earn-money/reddit_developer_funds.md) for apps you launch
