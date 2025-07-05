# Tutorials

## [Intro to Devvit](./tutorials/intro-to-devvit.mdx)

This interactive tutorial will help you get to know Devvit and help [r/Devvit](https://www.reddit.com/r/Devvit/) get to know you! You'll learn how to work with templates, run a playtest, and create an interactive post on Reddit. When you're done, you'll have your own introduction post that you can share with the community.

**Capabilities used:**

- [Templates](../templates.mdx)
- [Interactive Posts](../interactive_posts.md)
- [Playtest](../playtest.md)

## [Remind me](./tutorials/remind_me.md)

Learn how to implement a Remind Me Later feature on Reddit using scheduler and the Reddit API client. The tutorial covers creating scheduled jobs, displaying custom input forms, and leveraging the chrono-node library to interpret user-inputted timeframes like "in two weeks." Users can set reminders from the overflow menu of a post, and the Remind Me app automatically sends private messages containing post links at the scheduled times, enhancing user engagement.

**Capabilities used:**

- [Menu actions](../capabilities/menu-actions)
- [Forms](../capabilities/forms)
- [Scheduler](../capabilities/scheduler)

## [Three strikes](./tutorials/three_strikes.md)

In this tutorial, you'll learn to implement a powerful moderation tool using Redis and the Reddit API, creating a "Three Strikes" system to manage rule violations within a community. The tutorial guides you through setting up the app, adding menu actions, and creating mod functionalities. The "Three Strikes" system imposes escalating penalties: a warning message for the first strike, a one-day community ban for the second, and a one-year ban for the third. The tutorial covers creating keys for authors using Redis, fetching posts and comments, checking and removing strikes, and even banning users when necessary. With step-by-step instructions and code snippets, you'll build a robust moderation tool that enhances community management on Reddit.

**Capabilities used:**

- [Menu actions](../capabilities/menu-actions)
- [Forms](../capabilities/forms)
- [Redis](../capabilities/redis)
