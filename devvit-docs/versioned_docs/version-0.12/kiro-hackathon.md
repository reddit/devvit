# Reddit x Kiro: Community Games Challenge 2025

Reddit and Kiro are hosting a virtual hackathon from October 13th to October 29th, 2025. We’re offering $45,000 in prizes for the best apps built for redditors.

## How to participate

Check out the hackathon website to read the rules and sign up for the competition. In this Hackathon we have two main categories:

- **Community Play**: Apps that make great use of massively multiplayer game mechanics to bring redditors together. We’re looking for both synchronous and asynchronous experiences built with the intention of bringing a multitude of players together.

- **Best Kiro Developer Experience**: How creatively did they integrate Kiro capabilities into their development workflow to make their life easier?

If you need some inspiration, check out our [App Showcase](./examples/app-showcase.mdx).

## Get started with Kiro

1. [Download Kiro](https://kiro.dev/downloads/) - Hackathon participants will receive an access code via DevPost within 12 hours of registration

2. [Create a new Devvit App](https://developers.reddit.com/new/template)

3. Choose your favourite template (Phaser, React, ThreeJS, basic) - every template contains a Kiro folder

4. Once your project is cloned and set up, open your project with Kiro

5. Make sure to enable the Devvit MCP so that Kiro automatically searches Devvit documentation throughout development

## Customize your Splash Screen

For this hackathon, it will be mandatory for you to customize the splash screen of your app. The splash screen is the first thing your players will see when your game shows up in their feeds. Make it enaging, vibrant and inviting. The Kiro steering docs included with all templates will ensure that Kiro will always try to update your splash screen to best reflect your game. But before you submit, take some time to generate some high quality assets and really think about how to invite your players to click on your game when they see your splash screen.
You can replace the images `assets/default-splash.png` and `assets/default-icon.png` to something really creative. You can also make sure that the title, and description of your posts are inviting and vibrant!

![splash screens](./assets/splash-screen-kiro.png)

#### Splash Screens Best Practices:

❌ **Don't**:

- Don't keep the default splash screen assets included with your template

✅ **Do**:

- Do create an engaging asset for the background (replace `assets/default-splash.png`)
- Do create an engaging game logo (replace `assets/default-icon.png`)
- Do personalize the header, description based on the context for that post
- Do personalize the post title based on the context for that post

👩‍🏫 **Tips and tricks**:

- If you have a level builder, consider including the level's difficulty on the splash screen (easy, medium, hard)
- If you're keeping track of how many people tried that level, consider displaying a success rate on the splash screen
- If you have a daily puzzle, consider including the date of that puzzle on the splash screen
- If you want, you can consider using bbase64 strings to dynamically set different backgrounds for each post

For more info, read the [documentation on splash screens](./capabilities/server/splash-screen.mdx)

## Getting in touch

Feeling stuck? Need some inspiration? You can get technical help and interact with other hackathon participants on the [Devvit Discord](https://discord.com/invite/Cd43ExtEFS) as well as the [Kiro Discord](https://discord.com/invite/kirodotdev)
