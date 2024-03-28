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

      <text wrap size="large" width="100%" color="black">
        Enter Pixelary, the MMO drawing game where creativity meets competition. The top player of
        the week is the reigning champion.
      </text>

      <vstack width="100%">
        <PixelText>Drawing</PixelText>
        <spacer size="xsmall" />
        <text wrap size="large" width="100%" color="black">
          Draw a random word in 60s. Post it for others to guess, or skip a turn. A correct guess
          earns you 500 points.
        </text>
      </vstack>

      <vstack width="100%">
        <PixelText>Guessing</PixelText>
        <spacer size="xsmall" />
        <text wrap size="large" width="100%" color="black">
          Guess within 24 hours to earn points, ranging from 200 to 75 based on the time left
          multiplier.
        </text>
      </vstack>

      <text wrap size="large" width="100%" color="black">
        Good luck, and may the best artist win!
      </text>
    </vstack>
  );
};
