# App lifecycle

Your app may go through several iterations on a subreddit. Here are a few procedures you might need.

## Adding an app to your subreddit

To add an app to your subreddit, find it on the [apps page](https://developers.reddit.com/apps). Click into the app details screen, and click the "Add to community" button.

![Post](./assets/install-app-button.png)

This will give you a list of subreddits that will allow you to add the app. Generally, you can only add an app to subreddits that you moderate. Select a subreddit where you wish to install the app.

![Post](./assets/communities-install-list.png)

## Removing an app from your subreddit

**Portal**  
Uninstallation is not yet available from the portal. Please uninstall from the CLI.

**CLI**  
You can find a list of installations by running `$ devvit list installs`. To uninstall an app, you can then run `$ devvit uninstall [app-name] --subreddit [subreddit-name]`.

```
$ devvit list installs
loading...... done

 App Name          Installed Subreddits
 ───────────────── ────────────────────
 test-app-one    r/testsub1 (v0.0.1)

 test-app-two    r/testsub2 (v0.0.3)

$ devvit uninstall test-app-one --subreddit r/testsub1
```

## Creating a new app

Note: the [quickstart](./quickstart.mdx) provides a simple guide to creating and publishing your first app. Check it out!

From the folder that you'd like to house your app folder, run the create command:

```
$ devvit new [app-name]
```

This will create a new project with `[app-name]`. `[app-name]` will be the primary way users identify your app on the Developer Portal and:

- must be all lowercase
- must be at least 6 characters
- have no starting numbers
- can include any letters (a-z), numbers (0-9), or hyphens (-)

**Select a project template**
You will be asked to select a project template to start. All templates produce functioning code that can be published immediately. See the current list of project templates here.

## Uploading and publishing an app

```
$ devvit upload
```

Move into your project directory and type `devvit upload`.
Note: you will be asked to select a “Version Bump” when uploading or publishing. Learn more about versioning.  
Uploading your app will create a private version of your app that you can see on developers.reddit.com and install into subreddits you moderate for testing purposes. Use this for debugging purposes before publishing. You can use devvit upload after your initial version has been published if you want to test new versions before making them available to other moderators.

```
$ cd ~/projects/myfirstapp
$ devvit upload
Bundling your app...... Success!
? Version Bump (Use arrow keys)
  major
  minor
❯ patch
  prerelease

Publishing new version "1.0.1" to Reddit...... Success!
```

## Updating your app

You can update your app using `devvit upload`.

When you update your app, you will need to define a new version number. **Subreddits will continue to use the old version until they choose to upgrade.** If your app is listed publicly, the new version will only be available after review.

**Versioning**
When using `devvit upload` you will be asked to choose a “Version Bump,” i.e. to increment your version Apps version number. Each option will increment your App’s version number differently.

| Version Bump | What will be incremented? | Example |
| ------------ | ------------------------- | ------- |
| Major        | X.0.0.0                   | 1.0.0.0 |
| Minor        | 0.X.0.0                   | 0.1.0.0 |
| Patch        | 0.0.X.0                   | 0.0.1.0 |
| Prerelease   | 0.0.0.X                   | 0.0.0.1 |

## Upgrading your subreddit to a newer version of an app

Your app will need to be **manually updated to each new version** you upload on every subreddit at this time.

- Log into your allowlisted Reddit Developer account at [https://www.reddit.com](https://www.reddit.com)
- Go to [https://developers.reddit.com/my-apps](https://developers.reddit.com/my-apps)
- Click on your app's listing
- You wil see a Communities section showing the subreddits on which your app has been installed along with the version installed on each
- If a new version of an app is available for a given subreddit, you will see a blue "Upgrade" button
- Click the button and follow the prompts to upgrade each installation

## Removing your app from the store

You can prevent new users from finding your app on the store by marking it "unavailable."  
Note that this will not remove the code from the store (you will still see it) and it will not remove the app from subreddits that have installed previous versions. This is because it is important to everyone that subreddits don't have functionality disappear suddenly, so once published and installed, that version will continue to exist until a moderator explicitly removes the functionality.

**Hide from the store UI**  
You can do this from developers.reddit.com by finding your app, clicking through to the app details page, scrolling down to the "Developer Settings" and toggling the "Available" option.
