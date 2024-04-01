import { Devvit } from '@devvit/public-api';
import { PageProps } from '../types/page.js';
import { PinToggler } from '../components/PinToggler.js';
import { Page } from '../components/Page.js';

export const AdminConfigurePage = ({
  navigate,
  pinPost,
  context,
  pinPostMethods: { updatePinPost },
}: PageProps) => {
  const { useState } = context;
  // Extra abstraction to avoid requests on every update
  const [pins, setPins] = useState(() => {
    return [...pinPost.pins];
  });

  const togglePin = (pinId: string) => {
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
    <Page>
      <Page.Content navigate={navigate}>
        <vstack gap="medium" alignment="top center" cornerRadius="medium" width={100} height={100}>
          <vstack>
            <text size="large" color="#fffff" alignment="center" weight="bold">
              Edit Your Pages
            </text>
            <spacer size="small" />
            <text size="small" color="#fffff" alignment="center" weight="bold">
              Hit save when you're happy with the configuration.
            </text>
            <spacer size="small" />
          </vstack>
          <PinToggler pins={pins} onPinPress={(pin) => togglePin(pin.id)} />
          <vstack alignment="bottom center">
            <button
              size="small"
              onPress={async () => {
                await updatePinPost({ pins });
                navigate('admin');
              }}
              appearance="plain"
            >
              Save
            </button>
          </vstack>
        </vstack>
      </Page.Content>
    </Page>
  );
};
