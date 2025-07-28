# Game Quickstart

This tutorial takes you through the step-by-step process of building your first game with Devvit. It should take you about 15 minutes to complete. Once complete, you'll be able to play your game in a Reddit post

## Try it out first

You can play the game from this tutorial [here](https://www.reddit.com/r/devvit_demos/comments/1lo8xio/twrblx/). It consists of a simple HTML5 game scene with buttons to call backend functions.

## What you'll need

- Node.JS (version 22.2.0+)
- Devvit CLI (version 0.12+)
- A github account and Git CLI
- A code editor

## Environment Setup

1. Install Node.JS and NPM ([instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
2. Check out the demo project (`git clone git@github.com:reddit/devvit-phaser-starter-experimental.git`)
3. Install dependencies (`cd devvit-phaser-starter-experimental && npm install`)
4. Create your own subreddit for testing ([instructions](https://support.reddithelp.com/hc/en-us/articles/15484258409492-How-to-create-a-community))

## Devvit Architecture

Once the project is checked out you'll see the following folder structure. Each of the folders is responsible for a part of your app:

**`src/client`:**  
This contains the client-side code for your application. You can use any web framework for your frontend (React, Vue, Angular, etc.). In this example, we are building a game, so we chose [Phaser.js](http://Phaser.js).

**`src/server`:**  
This contains the server-side code for your application. You will need to build a node-compatible server that handles API calls from the client-side. This is where you will write code for persistence, real-time message sharing between players, payment validation, etc. For this example we chose to use [express.JS](https://expressjs.com/)

**`src/shared`:**  
This contains classes, types and interfaces that are shared between the client and the server

**`devvit.json`:**  
This special file in the root of the project contains configurations for many of the Reddit-specific services that your application can use. For more information on `devvit.json` please refer to Configuration (devvit.json)

## Building your game

To build your game, run the following command:

```shell
npm run login
npm run deploy
```

The first command will authenticate with your Reddit account. The CLI will give you instructions on how to authenticate. You will be redirected to an authentication page and be instructed to copy an authentication token back into the terminal.  
The second command will build your client and server packages. In addition, it will upload the application's bundle to [Devvit Developer Portal](https://developers.reddit.com/apps). The CLI will ask you questions about the application, and will give you instructions on account verification. Follow the instructions in your terminal until you get the message

```shell
✨ Visit https://developers.reddit.com/apps/<app_name> to view your app!
```

Now your game is built, uploaded, and ready to test.

## Testing your game

You need to test your game on a subreddit. Your backend calls will not work when testing the game locally. For that we will be leveraging Devvit's Playtest tool. If you have a preference for a specific subreddit to playtest, change the `package.json` file to include your subreddit name in `dev:devvit`:

```javascript
"scripts": {
    //...
    "dev:devvit": "devvit playtest r/MY_PREFERRED_SUBREDDIT",
    //...
}
```

If you decide to not provide a preferred subreddit, one will be created automatically for you.

Once you're ready to test the game, run the following command:

```shell
npm run dev
```

This command will build both your client and server packages, and then initiate a playtest on your test subreddit. Once the command succeeds, it will output the URL of the test subreddit where the playtest is running. Open the URL, and in your subreddit, look for the three dots button on the top right corner. Click that button and look for the menu action called `[YOUR_APP_NAME] New Post`. This will create a new interactive post that runs your app. Tap that menu action and wait for post creation. Once the post is created it should, click the “PLAY” button and test out your application.

## Conclusion

Now you have an application that runs inside of a Reddit post. You can now use this scaffolding to build your own application or game with Devvit.

## Further Reading

- Build a game using Bolt.new
- Build a game using Cursor.ai
- Build a game with real-time multiplayer
- Build a game with leaderboards
- [Launching and Promoting your game](../guides/launch/launch-guide.md)
