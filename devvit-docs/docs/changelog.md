# Changelog

While we're always shipping fixes and improvements, our team bundles new features, breaking changes, and other user-facing updates into regular releases. This page logs the changes to each version of Devvit.

Before upgrading `@devvit/public-api` in your project, always update the CLI first by running `npm install -g devvit`.

## Devvit 0.10.25: Take two: devvit publish

**Release Date: Aug 16, 2024**

Devvit 0.10.25 includes the devvit publish CLI commands that were missing in 0.10.24. This release also includes a small fix for when certain Redis commands were returning 0 instead of null.

## Devvit 0.10.24: Publishing from the CLI and other fixes

**Release Date: Aug 12, 2024**

Devvit 0.10.24 streamlines the app review process. Now when you use `devvit publish`, your app is automatically submitted for approval. The CLI will prompt you to select how you want your app to be displayed: public or unlisted. See [publishing an app](publishing.md) for details. We also added support for Node v22.

This release includes a handful of devvitor-requested features and fixes:

- API Client updates:
  - Added the ability to get social links for a user: `const socialLinks = await user.getSocialLinks()`
  - Made `redditId` as optional for `addModNote`
  - Fixed `getByUsername()` for suspended accounts so that it sends back undefined instead of throwing a 404
  - Added `approvedAt` and `bannedAt` fields to posts and comments
- Other updates:
  - Fixed validations running on nested settings
  - Standardized casing for Redis methods
  - Added `unwatch()` to Redis

## Devvit 0.10.23: Additional triggers and some fixes

**Release Date: July 24, 2024**

Devvit 0.10.23 adds new [mod triggers](./capabilities/triggers.md#nsfw-and-spoiler-triggers) when user posts are marked as NSFW or spoiler by mods.

This release also includes some hot fixes related to the realtime capability and our CLI metrics.

## Devvit 0.10.22: Adding image uploads to forms and CLI metrics

**Release Date: June 10, 2024**

Devvit 0.10.22 introduces an experimental feature update that lets you add [image uploads](./capabilities/forms.md#image-uploads) to forms. Right now it’s available on web, with Android and iOS support coming soon! We've also added CLI metrics that collect data and let us continually improve the developer experience. To opt out of this, run `devvit metrics off` after upgrading.

This release also moves two features out of the experimental phase: [realtime](./capabilities/realtime.md) and [cache helper](./capabilities/cache.md) are good to go.

## Devvit 0.10.21: @devvit/kit lets you build apps faster

**Release Date: May 22, 2024**

We’re introducing [@devvit/kit](./devvit_kit.md), a helper library that makes it easier to build Devvit apps. The kit includes UI components and general backend patterns that simplify common tasks, including pagination, columns, and toasts. We’ll be adding more to this kit and open-sourcing it soon!

Also in this release, [secrets storage](./capabilities/secrets-storage.md) has been vetted and is no longer considered experimental.

## Devvit 0.10.20 Experimental faster scheduler and breaking changes

**Release Date: May 7, 2024**

Devvit 0.10.20 introduces an experimental feature update that lets you [run scheduled jobs faster](./capabilities/scheduler.md#faster-scheduler) by adding seconds to your cron expression.

**Breaking changes**

- Two new moderator permissions were added: `channels` and `chat community`. This is a breaking change, which means:

  - You’ll need to update your app and push a new version.
  - Every installer needs to update their app to the latest version.

- The `currentUser()` method can be undefined to support logged out users. This change doesn’t impact existing apps, but when you upgrade your app, you’ll need to handle both undefined and normal user object responses from this method.

**Updates**

- Fixed `useInterval` loop reliability on mobile clients.
- Removed deprecated commands from `devvit help`.

## Devvit 0.10.19: Dimensions

**Release Date: April 24, 2024**

Devvit 0.10.19 lets you build responsive custom posts that render based on the user’s device. You can now use [dimensions](./dimensions.md) within the context object to build a responsive app, and this experimental feature lets you resize your screen as you develop to see how your posts will respond in real time.

## Devvit 0.10.18: Realtime and menu action filters

**Release Date: April 4, 2024**

Devvit 0.10.18 introduces an experimental feature: [Realtime](./capabilities/realtime.md) to create live, event-driven custom posts. We’ve also added a filter that lets you decide where menu actions show up in custom posts.

## Devvit 0.10.16: New look and more on Blocks

**Release Date: February 22, 2023**

Devvit 0.10.16 is a small release that gives our docs a new look and adds updated [blocks](blocks/overview.mdx) content.

## Devvit 0.10.15: updated error messages

**Release Date: February 16, 2024**
Devvit 0.10.15 has updated error messages to clearly communicate loading states, app installation status, post rendering failures, and maintenance issues.

## Devvit 0.10.14: New Redis commands and a few bug fixes

**Release Date: January 25, 2024**

Devvit 0.10.14 is a small release that brings more Redis improvements and fixes a few known issues.

**Redis improvements**  
We made [Redis](./capabilities/redis.md) errors more developer-friendly and also added new methods:

- Sorted Sets: zrank and zincrby
- Redis Hash: hincrby

**Bug fixes**

- Windows users were unable to use Devvit properly with the last release. This issue has been resolved.
- The [cache helper](./capabilities/cache.md) now keeps track of local state and no longer causes unnecessary server calls.
- `devvit playtest` and `devvit logs` output is less verbose and easier to understand.

## Devvit 0.10.13: Text wrapping and adding links (navigateTo)

**Release Date: January 18, 2024**

These two previously experimental features have been pressure-tested and are ready to graduate to released status. Check out how to [format text blocks](./blocks/text.mdx) and [add links](./capabilities/adding-links.mdx) to your custom posts!

These features are supported on the web and for Android and iOS Reddit app version 2023.50.0 and above (tap your snoovatar, then tap **Settings** and scroll all the way down to see your app version).

**Bug fixes**

Devvit 0.10.13 also includes a few technical updates:

- Now you’ll receive an error if a render method doesn’t return a component (previously it would just fail unexpectedly).
- We’ve fixed some issues in useState. Previously, state changes that relied on prior state used this pattern:

```ts
const [count, setCount] = useState(0);
setCount(count + 1);
```

The correct pattern is now:

```ts
const [count, setCount] = useState(0);
setCount((count) => count + 1); // Pass function to be given prior state.
```

## Devvit 0.10.12: Install Settings Fix

**Release Date: December 15, 2023**

- **App configurations bug fix**  
  The default installation settings were overriding the app configurations set in the developer portal. This has been fixed.

## Devvit 0.10.11: Secret storage, global app configuration, and additional app information

**Release Date: December 13, 2023**

Devvit 0.10.11 introduces better visibility for the types of permissions your app uses and communicates that information to Reddit users and installers. We are also adding long-awaited features of secrets storage and global app configurations!

**Secrets storage**  
Developers can now store app variables containing sensitive information (like API keys or credentials) that won’t be visible to users. Learn how to set up [secrets storage](./capabilities/secrets-storage.md).

**Global app configuration**  
You can now set app configuration at a global scope. These will not be modifiable by installers and are set via the CLI. See the changes to the [app configuration docs](./capabilities/app-configurations.md).

**App permissions labeling**  
Your app permissions are now represented in the app details page, the install details page, and the CLI (if you are installing from the CLI) that shows users how the app will handle data once it’s installed. Check out the Devvit APIs associated with each label [here](./get-started/permissions.md).

More granular mod permissions per app are on our roadmap but are not part of this update.

## Devvit 0.10.10: Redis improvements, link navigation, text wrapping

**Release Date: December 6, 2023**

Devvit 0.10.10 is a small release with fast follow improvements to our new Redis plugin, as well as two alpha features for working with blocks.

_**Redis improvements**_

Based on the feedback from our Redis launch, we’ve included a few more [methods](./capabilities/redis.md) to make working with Redis easier.

- Hash: hgetall, hscan, hdel, hkeys
- Sorted Sets: zscore

These methods enable additional functionality and get to parity with the kvStore’s list functionality. We’ve updated the migration guide [migration guide](./migrate_kv_to_redis.md) to reflect these changes.

_**Experimental link navigation**_

Linking to pages on Reddit, as well as off-platform linkouts, is now available with [navigateTo](./capabilities/adding-links.mdx). For Reddit content, you will be able to use a thing id or the url.

:::note
Off-platform linkouts will always include a warning dialogue for end-users to ensure a more secure experience.
:::

_**Experimental text wrapping**_

Those of you working with our custom post feature will likely have noticed minimal control of text formatting. Our first expansion is the addition of attributes to help with [text wrapping](./blocks/text.mdx).

#

## Devvit 0.10.9: Playground & additional functionality for Blocks

**Release Date: October 31, 2023**

_**Playground: an interactive code editor**_  
We wanted iteration on custom posts to be faster, so we built playground (stylized :play). It’s a lightweight interactive code editor and live preview you can use to see what your custom posts will look like. Check out **[developers.reddit.com/play](https://developers.reddit.com/play)** and learn more in the [blocks playground documentation](playground.md). [**:play is open-source!**](https://github.com/reddit/play)

_**Dimensions: height and width control**_  
We’ve made a few adjustments to how height and width work in blocks.

- `height` is now a property on `addCustomPostType` to define the post height.
- Developers can now set pixels or percentages for all height and width values (e.g. ‘100px’ or ‘100%’)
- We’ve also made modifying elements more specific with properties including:
  - `maxWidth`
  - `maxHeight`

Learn more in the [dimensions documentation](dimensions.md).

_**useInterval (experimental)**_  
We are giving you early access to `useInterval`. This allows you to re-render your post at defined time intervals so you can make your custom posts more interactive. Learn more in the [useInterval documentation](working_with_useinterval.md).

## Devvit 0.10.8: Increased storage functionality with Redis

**Release Date: October 24, 2023**

0.10.8 offers more robust storage management with [Redis](./capabilities/redis.md). Up until now, our [key value store plugin](https://developers.reddit.com/docs/kv_store_plugin) has been built using Redis, but has lacked many of the useful features that are available directly via the open source tool, such as:

- Transactions (e.g. counting votes atomically in polls)
- More efficient reads and writes (e.g. batch writing, incrementing numbers)
- Sorted sets (e.g. efficiently creating leaderboards)

This release comes with expanded Redis support via the new Redis plugin, which replaces the key value store. All apps using the key value store will need to [migrate to Redis](migrate_kv_to_redis.md) in order to use the latest version of Devvit.

## Devvit 0.10.7: Publishing via the command line

**Release Date: October 17, 2023**

Our beta is outgrowing some of the early restrictions we placed on app publishing and installation. As we have teased over the last few months, publishing your app is now available to all our Devs without waiting for approval from our app review committee, for use in subreddits you moderate.

**Note**: All auto-published apps are reviewed retroactively and monitored. And, to have your app listed in the public Directory, you will still need to [submit your app for pre-approval](https://docs.google.com/forms/d/e/1FAIpQLSdEyE5vrqOBlojue_mkrV25RiiHv_sxe-xqtcdzCMBTWmoROA/viewform?usp=sf_link).

**This version introduces breaking changes to our CLI**, so make sure to install the latest version of Devvit by following the [upgrade instructions](https://developers.reddit.com/docs/update-devvit).

_Publishing Apps_

With 0.10.7, you can publish your app to the Developer Portal in a private state for use across any subreddit you moderate, automatically.

**Updated app states and commands**:

1. **Uploaded**: your app is available for use within test subreddits (less than 200 subscribers) you moderate. To do this, run devvit upload from your CLI.
2. **Published**: your app can be installed in any subreddit you moderate, but cannot be installed, viewed, or managed by anyone else. To do this, run devvit publish from your CLI, or select “publish” on the app details page.
3. **Publicly Listed**: your app can be viewed and installed by anyone else browsing the Developer Portal. **These apps must be pre-approved by our team.** [Submit your app for review here to have your app listed](https://docs.google.com/forms/d/e/1FAIpQLSdEyE5vrqOBlojue_mkrV25RiiHv_sxe-xqtcdzCMBTWmoROA/viewform?usp=sf_link).

Our team will continue to review and monitor all published apps, regardless of their visibility, but you will no longer need to wait for us to complete this review to update and use your private apps.

If your app uses HTTP fetch, you will need to get your app pre-approved to publish your app. You must also provide a link to a user agreement and privacy policy for apps that use fetch. These can be added on your App Details Page.

## Devvit 0.10.6: Fully baked accounts and an icon library

**Release Date: October 9, 2023**

**Fully baked accounts**  
Our wonderful dev u/snoosnek has brought an end to the issue of zombie app accounts plaguing Dev Platform. With 0.10.6, your apps will now create fully “baked” and functional app accounts on upload, no assistance from our team required.

**Icon library**  
At Reddit, we have a visual product “language” for our UX and design, including a large library of [icons](https://developers.reddit.com/docs/icons) that are compatible for light and dark more.

Developer Platform custom posts now have full access to this library of icons so devs can create UIs and button iconography that integrate seamlessly with the rest of Reddit. Check out our full [icon gallery](https://www.reddit.com/r/Devvit/post-viewer/17417kp/icon_gallery/) on r/Devvit.

## Devvit 0.10.4: New moderation and collection API methods

**Release Date: August 28, 2023**

We’ve added new [Reddit API methods](https://developers.reddit.com/docs/api/redditapi/classes/models.Subreddit#) that provide additional moderation features and ways to access and manage collections.

- Subreddit Moderation methods:
  - getReports
  - getUnmoderated
  - getSpam
  - getEdited
- Collections:
  - New Collection object
  - getCollectionsForSubreddit
  - createCollection
  - getCollectionById

## Devvit 0.10.3: App image assets

**Release Date: August 15, 2023**

Devvit 0.10.3 is a small but mighty release that gives you the ability to add images to your apps. Learn more about [app image assets](https://developers.reddit.com/docs/app_image_assets) and [styling an image](blocks/image) to get started.

## Devvit 0.10.2: Modmail trigger, playtest, and more

**Release Date: August 1, 2023**

Devvit 0.10.2 adds a new trigger, an easy-to-use playtest tool, additional API endpoints, and updated content for two of our recent features.

_New features_

- **Modmail trigger**  
  You can now set a [modmail trigger](https://developers.reddit.com/docs/event_triggers) to alert your app when modmail is sent or received.
- **Playtest**  
  Our new [testing tool](https://developers.reddit.com/docs/playtest) lets you install your work-in-progress app on a live subreddit to test your app in real time.

_Fixes and enhancements_

- **Image uploads**  
  When [image uploads](https://developers.reddit.com/docs/media_uploads) rolled out in the last release, you asked for more information. You got it. Now you can learn how to use a template or upload an image from scratch.
- **Custom posts**  
  We’ve updated the [overview](https://developers.reddit.com/docs/custom_posts), added a [project guide](https://developers.reddit.com/docs/custom_post_project_guide), and added a technical page to provide more details for [custom post usage](https://developers.reddit.com/docs/custom_post_usage).
- **Additional API endpoints**  
  You can now use additional endpoints for retrieving user flair, managing modmail, and adding the secure media field to posts.

## Devvit 0.10.1: Media uploads

**Release Date: July 18, 2023**

Devvit 0.10.1 is a lighter release with a few key updates. This release does not introduce breaking changes to 0.10.0 projects.

_Fixes and Enhancements_

- **Image upload support**  
  You can embed hosted [images](https://developers.reddit.com/docs/media_uploads) into a post or comment via Devvit.
- **Report content via the Reddit API Client**  
  You can use the Reddit Client API to report posts or comments.
- **New Mod resources**  
  We've added everything a mod needs to know about [installing apps](https://developers.reddit.com/docs/mod_app_install).

## Devvit 0.10.0: The Next Version of Devvit

**Release Date: July 2, 2023**

If you’ve found yourself confused by all the “api-next” stuff, don’t worry, you’re not alone! It’s the name we’ve used for a refresh on our dev experience as we build in UI component support. We’ve been working hard to unify the frameworks for our “Block Kit” for custom posts and previous Devvit versions.

The latest Devvit release is a breaking change. Devvit apps on old versions will continue to work, but you'll need to update them in order to take advantage of the new functionality. Our documentation now reflects some updated naming, syntax, and conventions that may look a little different to our more veteran users.

See our full [migration guide](https://developers.reddit.com/docs/migration_guide) to port over your existing projects. If you were using `public-api-next` please see [these instructions](https://developers.reddit.com/docs/migration_guide#moving-from-public-api-next).

_Devvit API Next Key Changes_

- **Metadata no longer required**  
  To help simplify things, we now handle passing around Metadata. You will no longer see it as a required param on most of our methods or API calls. Bye, metadata.
- **Custom posts**  
  Everyone will now be able to see and access our MVP “Block Kit” for custom UI components. The first surface you can customize with these are Custom Posts. See examples of what you can build and the links to key tutorials [here](https://developers.reddit.com/docs/custom_posts).
- **New Triggers**  
  We added [new triggers](https://developers.reddit.com/docs/event_triggers) for Post Flair Updates and Mod Actions, which are actions that show up in the mod log.

_Additional Updates_

- **Menu actions in modqueue**  
  [Menu actions](https://developers.reddit.com/docs/menu_actions) are now visible in posts and comments in the modqueue on new Reddit, iOS, and Android.
- **Simpler developer experience**  
  Changed typechecks to allow unused variables and allow implicit any for an easier developer experience for those unfamiliar with typescript.
- **App configurations bug fix**  
  Fixed bug where default values were overriding values for app configurations.
- **Dynamic forms**  
  With the new menuItem and createForm function you're able to create [dynamic forms](https://developers.reddit.com/docs/menu_actions#dyanmic-forms) that pass through values from app configurations or the kvStore.
- **API client updates**  
  Add subreddit id & name to Comment, add combined post & comment listing method (`reddit.getCommentsAndPostByUser`) for user’s overview, Add info endpoint (`subreddit.getCommentsAndPostsById`) for multiple thing ids within a subreddit, and Add removal reasons endpoints (`subreddit.addRemovalReason` or `subreddit.getRemovalReasons`) including adding a removal reason object to a Comment or Post (`post.addRemovalNote` or `comment.addRemovalNote`).
- **Fix for default values on app configurations**  
  Fixed issue with defaultValues not populating or overriding values in app configurations form.

## Devvit 0.9.6: App configurations are here!

**Release date: May 18, 2023**

You can now add simple configurations to your app! Once the app is installed, the configuration settings are available on the Install Settings page. Moderators add the required input and save the changes to configure the app on a per-subreddit basis.

There are currently four supported types of input:

- Text
- Boolean
- Number
- Dropdown selection

Read more about [install settings](./capabilities/app-configurations.md) and how to add them to your apps.

#### Updating to the latest version of Devvit:

Open a terminal and run the following command:

```bash
npm i -g devvit
```

Run the following from within the project directory of any apps that are on older versions:

```bash
npm i @devvit/public-api
npm i @devvit/tsconfig
```

## Devvit 0.9.5: Introducing the Devvit scheduler!

**Release date: May 11, 2023**

Our long awaited [scheduler](./capabilities/scheduler.md) is finally here! The scheduler can store and execute future actions to your app, like sending a private message at a specified time, tracking upvotes, or scheduling time-outs for user actions. You can:

- Schedule an action
- Schedule a recurring action
- Cancel an action

Learn more about the Scheduler and how to implement it [here](./capabilities/scheduler.md).

_CLI Enhancements_

- **Devvit login fixed**  
  Users that were seeing a 401 on login should no longer encounter this error.
- **Streaming logs no longer requires app name**  
  You no longer need to specify app name when using devvit logs.
- **Improved CLI readability**  
  We’ve made copy and color changes to our CLI to help improve readability and navigation.

_Fixes_

We no longer automatically run installs, so you'll need to manually run `yarn`, `npm i`, or `pnpm i` to install packages.

## Devvit 0.9.3: Quick Fixes

**Release date: May 2, 2023**

_Fixes and Enhancements_

- **Typechecking now a warning**  
  Rather than resulting in a error, our typechecking should now just produce warnings.
- **Devvit Install fixed**  
  `devvit install` was broken from the CLI. You can now install apps from the command line and the Portal again.

## Devvit 0.9.1: More event triggers and updated docs

**Release date: April 19, 2023**

In this release, we've:

- added two new supported [event triggers](https://developers.reddit.com/docs/event_triggers) (OnAppInstall and OnAppUpgrade)
- updated the docs to include more details on creating custom [menu actions](https://developers.reddit.com/docs/menu_actions)

## Devvit 0.9.0: HTTP Fetch

**Release date: April 12, 2023**

Your Devvit app can now make network requests to access allow-listed external domains using HTTP Fetch. This enables your app to leverage webhooks, personal servers, and other third-party integrations asynchronously across the network.

To request a domain to add to the allow-list, please [fill out the request form](https://docs.google.com/forms/d/e/1FAIpQLSe_Bbs37LQe3Nrgyg6UJgOHQzYnvPRWb0tQSwf3vwKSUJaV8A/viewform).

_Enhancements_

**Updating Devvit**

To update Devvit:

- Uninstall @devvit/cli using `npm -g uninstall @devvit/cli`.
- Then install using `npm install -g devvit`.

## Devvit 0.8.11: App Accounts

**Release date: March 29, 2023**

If you have Comment Nuke installed in one of your subreddits, you may have noticed a pesky quirk about Devvit app installations: the app doesn’t have an account associated with the actions it takes on the site. Our latest release fixes this issue with the introduction of [app accounts](./get-started/app-accounts.md). These accounts will behave as bots, installers, and show up in mod logs when your app takes programmatic user-actions.

_Additional Enhancements_

- **API Client updates**  
  We are working on taking your feedback into account for expanding our Reddit API client. This release we have included the widgets API!
- **Type Checking in Studio**  
  When launching Devvit Studio, you'll see immediate Typescript type errors in the build logs while developing your app. Additionally, we'll ensure your apps are fully typesafe before allowing uploads.

## Devvit 0.8.9: Event Triggers

**Release date: March 16, 2023**

_Devvit Support for Event Triggers_

This release includes support for [Event Triggers](https://developers.reddit.com/docs/event_triggers)!
A trigger allows your app to automatically respond to a user action or event. For example, if you set the OnSubredditSubscribe trigger, the app will automatically respond when a user joins the community.

**Supported triggers**

- OnPostSubmit
- OnPostUpdate
- OnPostReport
- OnCommentSubmit
- OnCommentUpdate
- OnCommentReport
- OnSubredditSubscribe

_Fixes_

- **Developer Studio is fixed for windows.**  
  Windows users will now be able to leverage our [local environment](https://developers.reddit.com/docs/dev_studio/) without issue.

## Devvit 0.8.8: New and improved API Client

**Release date: March 8, 2023**

_Devvit’s New Reddit API Wrapper_

We’ve added a new Reddit [API client](https://developers.reddit.com/docs/api) to make writing Dev Platform apps more delightful and straightforward.

For example, to use the new API client to retrieve all the comments on the hottest post:

```typescript
/**
 * The Reddit API client lets us make calls to the Reddit API.
 * To use it, we must import and instantiate it at the top of our main.ts file.
 */

import { RedditAPIClient } from '@devvit/public-api-old';

const reddit = new RedditAPIClient();

const memes = await reddit.getSubredditByName('memes', metadata);
const posts = await memes.getHotPosts(metadata).all();
const hottestPost = posts[0];
const comments = await hottestPost.comments().all();
```

## Devvit 0.8.4: Critical bug fixes, app IDs, and multiple contexts for actions

**Release date: February 9, 2023**

_Fixes_

- **`devvit upload` is fixed.**  
  Depending on your version of Devvit, you may be experiencing issues with uploading apps from the CLI. [Upgrading Devvit](https://developers.reddit.com/docs/update-devvit/) will fix this issue.

- **CLI output corrected for app updates.**  
  We have corrected the CLI output when [updates to apps are made](https://developers.reddit.com/docs/app_update_details/).

- **Studio updates**  
  We’ve made some fixes and minor style upgrades to our local environment. This includes fixing where moderator specific context actions appear in [Studio](https://developers.reddit.com/docs/dev_studio/).

_Enhancements_

- **ModNote APIs are now available!**  
  [ModNotes APIs](https://developers.reddit.com/docs/api/redditapi/interfaces/ModNote/) are an essential addition to building great mod apps.

- **Simplified app naming**  
  You no longer need to come up with a unique name for your app. Just create a name that is 16 characters or less, and we'll give your app a unique ID when you upload it to Devvit.
- **Multiple contexts for Devvit.addAction**  
  It is now possible to add an array for contexts into the context field of addAction. For example, we use this new capability in our Three Strikes mod tutorial:

```js
{
   name: 'Remove All Strikes from Author',
   description: `Reset the author's strike count to zero`,
   context: [Context.POST, Context.COMMENT], // multiple contexts
   userContext: UserContext.MODERATOR,
   handler: clearStrikes,
 }
```

_Breaking Change_  
**event.context has new properties**  
`event.context` is no longer an object containing the `subredditId` or `userId`. `event.context` now contains contexts like `context.POST`. Devs will have to pull properties like Ids from the metadata.

## Devvit 0.8.2: Developer Studio, community app management, simpler environment setup

**Release date: January 18, 2023**

**Studio**

[Developer Studio](https://developers.reddit.com/docs/dev_studio) lets you do real-time debugging of your app on your local machine. Get your app running on production data and use your web browser’s developer tools to set breakpoints and inspect execution of your app in real-time.

**Community app management**

See all the subreddits you moderate for easy app management. This is also where mods who are not developers can view, find and manage (upgrade, uninstall) apps which are installed on their subreddit. The [community app management](https://developers.reddit.com/docs/manage_your_communities) page will be linked from Mod Tools.

**Simpler environment setup**

We’ve published a simple script that lets you install devvit and its dependencies with a single command. This will be helpful for our new user setting up Devvit for the first time. [See it in action here](https://developers.reddit.com/docs/quickstart).

## Devvit 0.8.1: simplified file structure

**Release date: January 11, 2023**

This is a minor release to improve the file directory structure for new Devvit apps. We’ve removed a number of folders and simplified file naming. Note: this only affects new projects created with Devvit 0.8.1 or later. Your existing Devvit apps will not be affected.

_New file structure_

```text
my-simpler-project
├── devvit.yaml
├── package.json
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock
```

## Devvit 0.8.0: cross-platform support

**Release date: December 9, 2022**

There are few handy new features and a few easy-to-fix breaking changes.

_New features_

- iOS support for custom actions is now available! Your apps should now be available on **web, Android, and iOS devices**. Write once, run everywhere ftw!

_Breaking changes_

- To import Reddit API types, use `Devvit.Types.RedditAPI.TYPE` (this replaces the `Devvit.Types.TYPE` syntax)
- To invoke Scheduler Handler, use `Devvit.addSchedulerHandler` (this replaces the `Devvit.SchedulerHandler.onHandleScheduledAction` syntax)
- Scheduler.Schedule requires both `cron` and `when`, even if you’re only using one. You can set the one you aren’t using to `undefined` (see [example](https://developers.reddit.com/docs/remind_me_tutorial/#define-your-action-handler))

_Enhancements_

- Enabled console.log() and related functions to be seen in `devvit logs` ([learn more](https://developers.reddit.com/docs/test))
- Added a new `--since` flag to view historical logs ([learn more](https://developers.reddit.com/docs/test))
- Added inline and [online](https://developers.reddit.com/docs/api/redditapi/interfaces/Flair) documentation for the Reddit API (autocomplete should be really helpful now!)
- Fixed issues with Listings and LinksAndComments Reddit API Types
- Added `Devvit.addAction` API interface to simplify action creation (see an [example](https://developers.reddit.com/docs/remind_me_tutorial))
