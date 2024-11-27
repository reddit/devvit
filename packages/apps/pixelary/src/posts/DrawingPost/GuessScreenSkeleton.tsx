import { Devvit } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import Settings from '../../settings.json';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';

interface GuessScreenSkeletonProps {
  drawing: number[];
  playerCount?: number;
  winPercentage?: number;
  dictionaryName?: string;
}

export const GuessScreenSkeleton = (props: GuessScreenSkeletonProps): JSX.Element => {
  const { playerCount = 0, winPercentage = 0, dictionaryName = 'main' } = props;
  const width = 256;

  return (
    <blocks height="tall">
      <zstack width="100%" height="100%" alignment="top start">
        <image
          imageHeight={1024}
          imageWidth={2048}
          height="100%"
          width="100%"
          url="background.png"
          description="Striped blue background"
          resizeMode="cover"
        />
        <vstack height="100%" width="100%" alignment="center middle">
          <spacer height="24px" />
          {dictionaryName && dictionaryName !== 'main' && (
            <PixelText
              color={Settings.theme.secondary}
            >{`${dictionaryName} ${dictionaryName.startsWith('r/') ? 'takeover' : 'event'}`}</PixelText>
          )}
          <spacer grow />
          <Drawing data={props.drawing} size={width} />
          <spacer grow />

          <PixelText
            color={Settings.theme.primary}
          >{`${abbreviateNumber(playerCount)} player${playerCount === 1 ? '' : 's'} tried`}</PixelText>
          {playerCount > 0 && (
            <>
              <spacer height="4px" />
              <PixelText
                color={Settings.theme.secondary}
              >{`${winPercentage}% got it right`}</PixelText>
            </>
          )}
          <spacer grow />
          {/* Footer */}
          <StyledButton
            width={`${width}px`}
            height="32px"
            label="GUESS THE WORD"
            appearance="primary"
          />
          <spacer width="8px" />
          <StyledButton width={`${width}px`} height="32px" label="GIVE UP" appearance="secondary" />
          <spacer height="20px" />
        </vstack>
      </zstack>
    </blocks>
  );
};
