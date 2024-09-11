import { Devvit } from '@devvit/public-api';
import { PageHeader } from './PageHeader.js';
import { PixelText } from './PixelText.js';

interface InfoPageProps {
  onClose: () => void;
}

export const InfoPage = (props: InfoPageProps): JSX.Element => {
  const { onClose } = props;
  return (
    <vstack width="100%" height="100%" alignment="center" padding="large" gap="large">
      <PageHeader title="Info" onClose={onClose} />

      <vstack width="100%">
        <PixelText>Draw</PixelText>
        <spacer size="xsmall" />
        <text wrap size="large" width="100%" color="black">
          Use colored pixels to draw a random word in 60 seconds. Submit your drawing for other
          players to guess (a correct guess scores you 500 points).
        </text>
      </vstack>

      <vstack width="100%">
        <PixelText>Guess</PixelText>
        <spacer size="xsmall" />
        <text wrap size="large" width="100%" color="black">
          Take your best shot at figuring out drawings from other redditors. Drawings are active for
          24 hours, and you'll earn between 75 to 200 points based on the time-left multiplier for a
          correct guess.
        </text>
      </vstack>

      <vstack width="100%">
        <PixelText>Win</PixelText>
        <spacer size="xsmall" />
        <text wrap size="large" width="100%" color="black">
          Check out the leaderboard to see your status. The top player of the week is the reigning
          champion, which comes with exclusive bragging rights.
        </text>
      </vstack>
    </vstack>
  );
};
