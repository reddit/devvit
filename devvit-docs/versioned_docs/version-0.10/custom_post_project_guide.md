# Project guide

Learn how to set up the framework for your custom post.

This guide will show you how to:

- Create a custom post project
- Add your custom post to a subreddit

## Create a custom post project

In this section, you’ll learn how to:

- Build a “Click me” click counter custom post type
- View and the test your custom post in Developer Studio

### Start a project​

To create a custom post app, use the `custom-post` template to start a new project.

1. From the terminal, navigate to a directory where you'll store your project.
2. Enter the following command to create a project folder on your local machine.

```ts
devvit new <replace-with-your-app-name> --template=custom-post
```

### Install dependencies​

3. To have your package manager install the dependencies, run the following command in the root of your project:

```ts
npm install
```

-OR-

```ts
yarn install
```

### Check out your post

Open your app in your test subreddit. Run the following command in the root of your project:

```bash
devvit playtest <replace with your test subreddit name>
```

You'll see a "Hello" post that looks like this:

![hello_blocks](./assets/hello_blocks_v2.png)

Now that you've created a custom post project, you’re ready to add your post to your subreddit.

## Add the custom post to a subreddit​

In order to add your custom post to a subreddit, you'll need to upload your app to the [Developer Portal](https://developers.reddit.com):

5. Navigate to the directory where your app is located and run `devvit upload`.
6. [Add the app to your subreddit](https://developers.reddit.com/docs/app_upload#add-your-app-to-a-subreddit).
7. Click on the subreddit menu to create the post.

![Menu](./assets/custom_post_menu_item.png)

8. Go to the newly created post in your subreddit. You’ll see something like this:

![New Window](./assets/custom_post_new_window.png)

9. To view your post you need to be on our new experimental web platform. Go to the post details page and change the URL from this:

   https://www.reddit.com/r/{yoursubredditname}/comments/{params}/{postname}/

   To this:

   https://sh.reddit.com/r/{yoursubredditname}/comments/{params}/{postname}/

10. Check out your custom post!
