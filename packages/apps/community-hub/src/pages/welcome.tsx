import { Devvit } from '@devvit/public-api';

import { PinToggler } from '../components/PinToggler.js';
import type { PageProps } from '../types/page.js';
import { standardizeUsername } from '../util.js';

type StepProps = Pick<PageProps, 'pinPost' | 'pinPostMethods' | 'context'> & {
  onPreviousPressed: () => void;
  onNextPressed: () => void;
};

const Step1 = ({ onNextPressed }: StepProps): JSX.Element => {
  return (
    <vstack padding="small">
      <text color="black white" size="large" alignment="top center" weight="bold">
        Set up the Community Hub!
      </text>
      <spacer size="small" />
      <text color="black white" size="small" alignment="top center" weight="bold">
        Everything mods need in one pinned post.
      </text>
      <vstack cornerRadius="large" alignment="middle center">
        <image url={'devvit-logo.png'} imageWidth={175} imageHeight={175} resizeMode="fit" />
      </vstack>
      <vstack alignment="center bottom">
        <button onPress={onNextPressed} size="medium" appearance="primary">
          Get Started
        </button>
      </vstack>
    </vstack>
  );
};

const Step2 = ({
  onNextPressed,
  pinPost,
  context,
  pinPostMethods: { updatePinPost },
}: StepProps): JSX.Element => {
  const { useForm } = context;

  const colorForm = useForm(
    {
      fields: [
        {
          name: 'light',
          label: `Color`,
          type: 'string',
          defaultValue: pinPost.primaryColor.light,
          required: true,
        },
      ],
      title: 'Update the Post Color',
      acceptLabel: 'Update',
    },
    async (data) => {
      await updatePinPost({
        primaryColor: {
          ...pinPost.primaryColor,
          ...data,
        },
      });
      context.ui.showToast(`${data.light} is now your post theme color!`);
    }
  );

  const addOwnerForm = useForm(
    {
      fields: [
        {
          name: 'newOwner',
          label: `Add user`,
          type: 'string',
          required: true,
        },
      ],
      title: 'Add additional post owners',
      acceptLabel: 'Submit',
    },
    async (data) => {
      const { reddit } = context;

      const subname = await reddit.getCurrentSubredditName();

      const submittedUserName = data.newOwner as string;

      const newOwner = standardizeUsername(submittedUserName);

      if (pinPost.owners.includes(newOwner)) {
        context.ui.showToast(`${newOwner} is already an owner!`);
        return;
      }

      await updatePinPost({
        owners: [...pinPost.owners, newOwner],
      });

      await reddit.sendPrivateMessage({
        to: newOwner,
        subject: "You've been added to a Community Hub",
        text: `You can now manage the ${subname} hub here: ${pinPost.url}`,
      });
      context.ui.showToast(`u/${newOwner} is now a post owner!`);
    }
  );

  const imageForm = useForm(
    {
      fields: [
        {
          name: 'featuredImage',
          label: `URL`,
          type: 'string',
          defaultValue: 'Must Reddit image link i.e. https://i.redd.it/0ujuzl4ki7yb1.png',
        },
      ],
      title: 'Update the home image',
      acceptLabel: 'Update',
    },
    async (data) => {
      await updatePinPost({
        featuredImage: data.featuredImage,
      });

      context.ui.showToast(`Your home image has been updated!`);
    }
  );

  return (
    <vstack>
      <vstack padding="small">
        <text color="black white" size="large" alignment="top center" weight="bold">
          Make it your own
        </text>
        <spacer size="small" />
        <text color="black white" size="small" alignment="top center" weight="bold">
          You can do this later, too!
        </text>
      </vstack>
      <zstack>
        <vstack cornerRadius="large" width={100} height={100} alignment="middle center">
          <image url={pinPost.featuredImage} imageWidth={175} imageHeight={175} resizeMode="fit" />
        </vstack>
        <hstack alignment="middle end" width={100} height={100} padding="small">
          <button
            onPress={onNextPressed}
            size="large"
            icon="caret-right"
            appearance="primary"
          ></button>
        </hstack>
      </zstack>
      <vstack alignment="center">
        <hstack>
          <button
            onPress={() => context.ui.showForm(colorForm)}
            icon="topic-art"
            appearance="plain"
          >
            Color
          </button>
          <spacer size="small" />
          <button
            onPress={() => context.ui.showForm(imageForm)}
            icon="image-post"
            appearance="plain"
          >
            Image
          </button>
          <spacer size="small" />
          <button onPress={() => context.ui.showForm(addOwnerForm)} icon="mod" appearance="plain">
            Owners
          </button>
        </hstack>
      </vstack>
    </vstack>
  );
};

const Step3 = ({
  pinPost,
  context,
  pinPostMethods: { updatePinPost },
  onNextPressed,
}: StepProps): JSX.Element => {
  const { useState } = context;
  // Extra abstraction to avoid requests on every update
  const [pins, setPins] = useState(() => {
    return [...pinPost.pins];
  });

  const togglePin = (pinId: string): void => {
    setPins((x) => {
      return x.map((pin) => {
        if (pin.id === pinId) {
          return { ...pin, enabled: !pin.enabled };
        }

        return pin;
      });
    });

    return undefined;
  };

  return (
    <vstack padding="small" width={100} height={100}>
      <vstack>
        <text color="black white" size="large" alignment="center" weight="bold">
          Pick Your Pages
        </text>
        <spacer size="small" />
        <text color="black white" size="small" wrap alignment="center" weight="bold">
          You'll be able to manage this in settings later.
        </text>
        <spacer size="medium" />
      </vstack>
      <PinToggler pins={pins} onPinPress={(pin) => togglePin(pin.id)} />
      <spacer size="small" />
      <vstack grow alignment="bottom center">
        <button
          onPress={async () => {
            await updatePinPost({ pins });
            onNextPressed();
          }}
          appearance="primary"
        >
          Save
        </button>
      </vstack>
    </vstack>
  );
};

const Step4 = ({ pinPostMethods: { updatePinPost }, onNextPressed }: StepProps): JSX.Element => {
  return (
    <vstack padding="small" width={100} height={100}>
      <text color="black white" size="large" alignment="top center" weight="bold">
        Almost Done
      </text>
      <vstack gap="small" padding="medium">
        <text color="black white" size="medium" wrap>
          Customize your hub using the edit/settings buttons on each page. (Only post owners can see
          these!) When you're all set, sticky your post.
        </text>
        <text color="black white" size="medium" wrap>
          We recommend linking to your hub from the subreddit welcome message, too. Clone,
          configure, or delete this hub from the settings page at any time.
        </text>
        <text color="black white" size="medium" wrap>
          Thanks for testing!
        </text>
      </vstack>
      <vstack grow alignment="bottom center">
        <button
          onPress={async () => {
            await updatePinPost({ status: 'live' });
            onNextPressed();
          }}
          appearance="primary"
        >
          Got it
        </button>
      </vstack>
    </vstack>
  );
};

const IsNotOwner = (): JSX.Element => {
  return <text color="black white">Post is getting ready for launch...</text>;
};

export const WelcomePage = ({
  context,
  navigate,
  pinPost,
  pinPostMethods,
  isOwner,
}: PageProps): JSX.Element => {
  const { useState } = context;
  const [step, setStep] = useState(1);

  if (pinPost.status !== 'draft') {
    navigate('welcome');
    return null;
  }

  if (!isOwner) {
    return <IsNotOwner />;
  }

  if (step === 1) {
    return (
      <Step1
        onNextPressed={() => setStep(2)}
        onPreviousPressed={() => setStep(1)}
        context={context}
        pinPost={pinPost}
        pinPostMethods={pinPostMethods}
      />
    );
  }
  if (step === 2) {
    return (
      <Step2
        onNextPressed={() => setStep(3)}
        onPreviousPressed={() => setStep(1)}
        context={context}
        pinPost={pinPost}
        pinPostMethods={pinPostMethods}
      />
    );
  }
  if (step === 3) {
    return (
      <Step3
        onNextPressed={() => setStep(4)}
        onPreviousPressed={() => setStep(2)}
        context={context}
        pinPost={pinPost}
        pinPostMethods={pinPostMethods}
      />
    );
  }
  if (step === 4) {
    return (
      <Step4
        onNextPressed={() => {
          navigate('home');
        }}
        onPreviousPressed={() => setStep(3)}
        context={context}
        pinPost={pinPost}
        pinPostMethods={pinPostMethods}
      />
    );
  }

  return null;
};
