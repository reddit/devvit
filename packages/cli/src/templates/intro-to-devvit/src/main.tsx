// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';
import { Weird, defaultColor, startingColors } from './weird.js';
import { Step, findBorderColor, Instructions, findUrl } from './guts/steps.js';
import { confirmationForm, requestDevvitPostingPermissions } from './guts/share.js';

Devvit.configure({
  redditAPI: true,
  http: true,
});

/* Adds a menu item to the subreddit menu.
The button creates a custom post. */
Devvit.addMenuItem({
  label: 'Hello Devvit',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    const user = await context.reddit.getCurrentUser();
    const username = user?.username ?? 'user';
    const newPost = await context.reddit.submitPost({
      title: `Hello ${username}`,
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    context.ui.showToast({ text: 'Created post!' });
    context.ui.navigateTo(newPost.url);
  },
});

/* Adds a custom post. Describes what happens on render.*/
Devvit.addCustomPostType({
  name: 'Custom Post',
  height: 'regular',
  render: (context) => {
    /* Defines the props and logic for what happens when buttons are clicked.
    Uses the Reddit client to get contextual data like current user username. */
    const [step, setStep] = context.useState(Step.Home);

    /* Grabs the current user's username with the Reddit API Client &
    handles the case for logged out users. */
    const [username] = context.useState(async () => {
      const user = await context.reddit.getCurrentUser();
      return user?.username ?? 'user';
    });

    /*!!!
    Tutorial Variables
    Variables that you'll edit to complete your tutorial!! 
    !!!*/

    const bodyTextCopy = `Hi ${username}! I'm Doot, your Devvit debugging buddy.\n\nLet's make some simple code changes as we playtest this app.`;
    const customColor: string = '#FFE338';
    let imgUrl = 'doot.png';

    //
    let button = <></>;
    let borderColor = customColor;
    let bodyText = (
      <text size="large" maxWidth={'50%'} wrap>
        {bodyTextCopy}
      </text>
    );

    /*
    [Start] Temporary section -
    The section below calls tutorial logic to render new instructions.
    You can delete it the end of the tutorial!
    */

    borderColor = findBorderColor(customColor, step);
    imgUrl = findUrl(imgUrl, customColor);
    bodyText = (
      <Instructions
        step={step}
        customColor={customColor}
        imgUrl={imgUrl}
        bodyText={bodyText}
        username={username}
        bodyTextCopy={bodyTextCopy}
      >
        {bodyTextCopy}
      </Instructions>
    );

    if (step === Step.Home && customColor === '#FFE338') {
      button = (
        <button appearance="primary" onPress={() => setStep(() => Step.Setup)}>
          Get Started
        </button>
      );
    }

    /*
    [End] Temporary section -
    The section below calls tutorial logic to render new instructions.
    You can delete it the end of the tutorial!
    */

    /* This is for an app easter 🥚 :) */
    const [isNormal, setIsNormal] = context.useState(true);
    const [activeColor, setActiveColor] = context.useState(defaultColor);
    const [data, setData] = context.useState(startingColors);

    /* Builds your UI! */
    if (isNormal) {
      return (
        <zstack grow backgroundColor={customColor} padding="small">
          <vstack
            gap="medium"
            //try customizing the background color!
            alignment="center top"
            border="thick"
            width={'100%'}
            height={'100%'}
            borderColor={borderColor}
          >
            <spacer size="small" />
            <image url={imgUrl} description="userimage" imageHeight={'70px'} imageWidth={'70px'} />
            <vstack alignment="center" width={'100%'}>
              {bodyText}
            </vstack>
            {button}
          </vstack>
          <vstack
            alignment="bottom end"
            onPress={() => setIsNormal((isNormal) => !isNormal)}
            width={'100%'}
          >
            <text size="small">🥚</text>
          </vstack>
        </zstack>
      );
    } else
    /* Returns the easter egg page.
    The component code is in the weird.tsx file. */
      return (
        <Weird
          data={data}
          setData={setData}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          isNormal={isNormal}
          setIsNormal={setIsNormal}
          customColor={customColor}
        />
      );
  },
});

/* Adds a menu item to the custom post.
The button pops up a form to share your post to Discord */
Devvit.addMenuItem({
  label: 'Share to Devvit',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const post = await context.reddit.getPostById(context.postId!);
    const postTitle = post.title;
    const user = await context.reddit.getCurrentUser();
    const username = user?.username ?? 'user';
    const content = `Hi, I'm ${username}! Check out my app: ${post.url}`;
    context.ui.showForm(confirmationForm, { content, postTitle });
  },
});

//gives your app posting permissions in r/devvit
Devvit.addTrigger({
  event: 'AppInstall', // Event name from above
  onEvent: async (_, context) => {
    await requestDevvitPostingPermissions(context);
  },
});

/* All projects need to include this in the main file. */
export default Devvit;
