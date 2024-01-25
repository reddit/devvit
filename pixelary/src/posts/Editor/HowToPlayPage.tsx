import { Devvit } from '@devvit/public-api';
import { PageHeader } from '../../components/PageHeader.js';
import { PixelText } from '../../components/PixelText.js';
import { editorPages } from './editorPages.js';

interface HowToPlayPageProps {
  setPage: (page: editorPages) => void;
}

export const HowToPlayPage = (props: HowToPlayPageProps): JSX.Element => {
  const { setPage } = props;
  return (
    <vstack width="100%" height="100%" alignment="center" padding="large" gap="large">
      <PageHeader title="Info" onClose={() => setPage('default')} />

      {/* How to play */}
      <vstack gap="medium" width="100%">
        <text wrap size="large" width="100%" color="black">
          Enter Pixelary, the MMO drawing game where creativity meets competition. The top player of
          the week is the reigning champion.
        </text>

        <vstack width="100%">
          <PixelText>Drawing</PixelText>
          <text wrap size="large" width="100%" color="black">
            Draw a random word in 60s. Post it for others to guess, or skip a turn. A correct guess
            earns you 500 points.
          </text>
        </vstack>

        <vstack width="100%">
          <PixelText>Guessing</PixelText>
          <text wrap size="large" width="100%" color="black">
            Guess within 24 hours to earn points, ranging from 200 to 75 based on the time left
            multiplier.
          </text>
        </vstack>

        <text wrap size="large" width="100%" color="black">
          Good luck, and may the best artist win!
        </text>
      </vstack>
    </vstack>
  );
};
