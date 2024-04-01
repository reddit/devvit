# Changelog

While we're always shipping fixes and improvements, our team bundles new features, breaking changes, and other user-facing updates into bi-monthly releases. This page logs the changes to each version of Devvit.

To use the latest version of Devvit, follow the [upgrade instructions](https://developers.reddit.com/docs/update-devvit).

## Devvit 0.9.6: App configurations are here!

**Release date: May 18, 2023**

You can now add simple configurations to your app! Once the app is installed, the configuration settings are available on the Install Settings page. Moderators add the required input and save the changes to configure the app on a per-subreddit basis.

There are currently four supported types of input:

- Text
- Boolean
- Number
- Dropdown selection

Read more about [app configurations](https://developers.reddit.com/docs/app_configurations) and how to add them to your apps.

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

Our long awaited [scheduler](https://developers.reddit.com/docs/scheduler) is finally here! The scheduler can store and execute future actions to your app, like sending a private message at a specified time, tracking upvotes, or scheduling time-outs for user actions. You can:

- Schedule an action
- Schedule a recurring action
- Cancel an action

Learn more about the Scheduler and how to implement it [here](https://developers.reddit.com/docs/scheduler).

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

**Updating Devvit** To update Devvit:

- Uninstall @devvit/cli using `npm -g uninstall @devvit/cli`.
- Then install using `npm install -g devvit`.

## Devvit 0.8.11: App Accounts

**Release date: March 29, 2023**

If you have Comment Nuke installed in one of your subreddits, you may have noticed a pesky quirk about Devvit app installations: the app doesn’t have an account associated with the actions it takes on the site. Our latest release fixes this issue with the introduction of [app accounts](https://developers.reddit.com/docs/app_accounts). These accounts will behave as bots, installers, and show up in mod logs when your app takes programmatic user-actions.

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

import { RedditAPIClient } from '@devvit/public-api';

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
- Scheduler.Schedule requires both `cron` and `when`, even if you’re only using one. You can set the one you aren’t using to `undefined` (see [example](https://developers.reddit.com/docs/remind_me_guide/#define-your-action-handler))

_Enhancements_

- Enabled console.log() and related functions to be seen in `devvit logs` ([learn more](https://developers.reddit.com/docs/test))
- Added a new `--since` flag to view historical logs ([learn more](https://developers.reddit.com/docs/test))
- Added inline and [online](https://developers.reddit.com/docs/api/redditapi/interfaces/Flair) documentation for the Reddit API (autocomplete should be really helpful now!)
- Fixed issues with Listings and LinksAndComments Reddit API Types
- Added `Devvit.addAction` API interface to simplify action creation (see an [example](https://developers.reddit.com/docs/remind_me_guide))
