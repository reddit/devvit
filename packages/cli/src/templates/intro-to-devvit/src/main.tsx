// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';
import { Weird, defaultColor, startingColors } from './weird.js';
import { Step, findBorderColor, findText, findUrl } from './setup.js';

Devvit.configure({
  redditAPI: true,
});

/* Adds a menu item to the subreddit menu.
The button creates a custom post. */
Devvit.addMenuItem({
  label: 'Add my custom post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const username = (await reddit.getCurrentUser())?.username ?? 'User';
    const newPost = await reddit.submitPost({
      title: `Hello ${username}`,
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(newPost.url);
  },
});

/* Adds a custom post. Describes what happens on render.*/
Devvit.addCustomPostType({
  name: 'Custom Post',
  height: 'regular',
  render: (context) => {
    /* Defines the props and logic for what happens when buttons are clicked.
    Uses the Reddit client to get contextual data like current user username. */
    const { useState } = context;
    const [step, setStep] = useState(Step.home);
    const { reddit } = context;

    const [username] = useState(async () => {
      return (await reddit.getCurrentUser())?.username ?? 'User';
    });

    /*!!!
    Tutorial Variables
    Variables that you'll edit to complete your tutorial!! 
    !!!*/
    let bodyTextCopy = `Hi ${username}! I'm Doot, your Devvit debugging buddy. Let's make some simple code changes as we playtest this app.`;
    const customColor = '#FFE338';
    let imgUrl = 'doot.png';

    //

    let button = <></>;
    let borderColor = customColor;

    /*
    Temporary section start -
    The section below calls tutorial logic to customize content.
    You can be delete it the end of the tutorial!
    */

    borderColor = findBorderColor(customColor, step);
    imgUrl = findUrl(imgUrl, customColor);
    bodyTextCopy = findText(step, customColor, imgUrl, bodyTextCopy, username);

    if (step === Step.home && customColor === '#FFE338') {
      button = (
        <button appearance="primary" onPress={() => setStep(() => Step.setup)}>
          Get Started
        </button>
      );
    }

    /*
    Temporary section end -
    The section above calls tutorial logic to customize content.
    You can be delete it the end of the tutorial!
    */

    /* This is for an app easter 🥚 :) */
    const [isNormal, setIsNormal] = useState(true);
    const [activeColor, setActiveColor] = useState(defaultColor);
    const [data, setData] = useState(startingColors);

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
            <text size="large" maxWidth={'50%'} wrap>
              {bodyTextCopy}
            </text>
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

/* All projects need to include this in the main file. */
export default Devvit;
