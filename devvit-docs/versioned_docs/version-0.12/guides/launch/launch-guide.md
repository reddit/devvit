# Launch Your App

Once your app is ready, you can launch it to users and moderators across Reddit. There are a few things you need to do to get your app "launch ready". This guide will walk you through that process.

Once you have created a polished app, you may also apply for **Reddit featuring**, which includes on-platform promotion and boosting of your app. Make sure to read this guide closely before filling out a [Reddit featuring request](https://forms.gle/pLEfhZFf6skc4Rto8).

We've broken the Devvit App Launch guide into four phases:

- **Alpha**: Use this stage to validate your core concept and catch major issues early.
- **Beta**: Test your game with real users on a public subreddit.
- **General Availability (GA)**: Share your app with all of Reddit!
- **Featured**: Work with the Reddit team to promote your app across the site.

How you launch your app in each of these stages depends on the type of app you’re building: a game or a community app.

## Games

Select your launch stage for instructions and guidelines to maximize your game's development.

<details>
  <summary>Alpha</summary>
  <div>
    <div>
   Share your app on r/Devvit to get technical feedback from other devs and Reddit admins:

1.  Create a public subreddit for your game.
2.  Create a game post in your public subreddit.
3.  [Cross-post](https://support.reddithelp.com/hc/en-us/articles/4835584113684-What-is-Crossposting) your game to r/Devvit with the flair "Feedback Friday”.

**Guidelines**

To get the best feedback:

- Post only once for a meaningful update (maybe a 2+ week gaps between versions)
- Respond to feedback within 24-48 hours.
- Test other developers' apps, too, to build relationships with your fellow devs.
</div>
    <br/>
  </div>
</details>

<details>
  <summary>Beta</summary>
  <div>
    <div>
  When you’re ready for broader player testing, launch your game on r/GamesOnReddit: 
  
  1. Go to your public subreddit for your game.
  2. Create a game post in your public subreddit.
  3. [Cross-post](https://support.reddithelp.com/hc/en-us/articles/4835584113684-What-is-Crossposting) a game post to r/GamesOnReddit with flair "Feedback”.

**Guidelines**

To get the best results, engage with players that give you feedback to start growing your community.

**Apps that have strong post engagement are great candidates for the next launch phase.**

</div>
    <br/>
  </div>
</details>

<details>
  <summary>GA</summary>
  <div>
    <div>
  When you're ready to publicly release your game:
  
  1. Upload the latest version of your app with `npx devvit upload`
  2. Publish your app with `npx devvit publish`
  
  Publishing your app triggers a thorough app review. Make sure your app has a detailed README in accordance with our [guidelines](https://www.reddit.com/r/Devvit/comments/1gfvsfy/all_published_apps_must_have_readmes/).

</div>
    <br/>
  </div>
</details>

### Best Practices for GAing your game

In order to have a successful app launch, please ensure your game has the following required and suggested best practices integrated into your experience. Reddit will not feature games that do not have these best practices implemented.

#### Required

- A compelling first screen - you **must** have a custom [splash screen](../../capabilities/server/splash-screen.mdx).
- Working across platforms - your game's viewport must be accessible and clean on both mobile and desktop platforms.
- Self-explanatory - anyone should be able to click into your post and have the context needed to play or participate.
- Responsive design - all screens should be visible within fullscreen, mobile, and desktop. Avoid unnecessary scrolls. Scrolling within inline webviews is prohibited.

#### Suggested

- A subscribe button - encourage re-engagement.
- Leaderboards - a view into a user's community standing.
- Community Flair - leverage [user flair](https://support.reddithelp.com/hc/en-us/articles/205242695-How-do-I-get-user-flair) to give users special distinction in the community (this can be done programmatically via the API).
- User Generated Content - provide ways for users to contribute (think: custom post comments, drawings, level builders, etc).

### Organic distribution

A published app is automatically shared with a small number of redditors, and engagement metrics will determine if our feed algorithms start to organically pick up your posts.

Key engagement metrics for games include:

- Contribution generation - comments and posts created
- Click through rate - how often users engage with your app
- Dwell time - how long users spend in your app
- Post score - upvotes vs downvotes ratio

Successful games will generate genuine conversation within each post, and create compelling content that engages redditors.

### Featuring with Reddit

Once your game has been published and approved, it may be featured by Reddit in one or more ways, such as:

- Games directory
- Featured promotional units
- Reddit's Game Feed
- Highlight in Reddit's Games sidebar

If you would like to apply for featuring, please [use this form](https://forms.gle/pLEfhZFf6skc4Rto8). We will respond to requests within two business days.

## Community apps

Apps that are built to use within a community (think mod tools like Bot Bouncer or interactive post apps like Community Hub) also follow the alpha, beta, and GA launch path.

<details>
  <summary>Alpha</summary>
  <div>
    <div>
   Share your app on r/Devvit to validate that your app solves real community problems:

1.  Create a public subreddit for your game.
2.  Create a game post in your public subreddit.
3.  On a Friday, cross-post your game to r/Devvit with the flair "Feedback Friday”.

You can also solicit feedback on the #mod-discussion Discord channel. Write a short description of your app that explains the problem your app solves, target community types, and how it fits into existing mod workflows. Include screenshots of the mode interface, and see what the community has to say.

**Guidelines**

To get the best feedback:

- Post only once for a meaningful update (maybe a 2+ week gaps between versions).
- Test your app with different permission levels (mod, approved user, regular user).
- Actively seek feedback from mods in your target communities.
</div>
    <br/>
  </div>
</details>

<details>
  <summary>Beta</summary>
  <div>
    <div>
  When you’re ready for broader testing, launch your game on a larger subreddit: 
  
  1. Upload the latest version of your app with `npx devvit upload`
  2. Publish your app as unlisted with `npx devvit publish`
  3. Once your app is approved, you can install it to a larger subreddit that you moderate for further testing. 
</div>
    <br/>
  </div>
</details>

<details>
  <summary>GA</summary>
  <div>
    <div>
When you're ready to publicly release your app, you’ll need to add it to the Apps Directory:
  
  1. Run  `npx devvit publish --listed`
  2. Once your app is approved, it will be publicly available in the Apps Directory for any mod to install.
</div>
    <br/>
  </div>
</details>

## Resources

- Got questions? Join our Discord or post in [r/Devvit](https://www.reddit.com/r/Devvit/).
- Review the [rules](../../devvit_rules.md) before publishing.
- Learn more about [how to earn](../../earn-money/payments/payments_overview.md) for apps you launch.
