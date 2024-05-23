// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';
import { Weird, defaultColor, startingColors } from './weird.js';
import { Step, findBorderColor, Instructions, findUrl, createPost } from './guts/steps.js';
import './guts/share.js';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
});

/* Adds a menu item to the subreddit menu. */
Devvit.addMenuItem({
  label: 'Hello Devvit',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: createPost,
});

/* Adds a custom post.*/
Devvit.addCustomPostType({
  name: 'Custom Post',
  height: 'regular',
  render: (context) => {
    /* Adds a state variable that moves the tutorial forward when a user gets started*/
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
      <text size="large" color="black" maxWidth={'50%'} wrap>
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
        context={context}
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
            <text color="white" size="small">
              🥚
            </text>
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
