import { Devvit } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { HeroButton } from '../../components/HeroButton.js';
import { PixelText } from '../../components/PixelText.js';
import Settings from '../../settings.json';

interface GuessScreenSkeletonProps {
  drawing: number[];
  playerCount?: number;
  dictionaryName?: string;
}

export const GuessScreenSkeleton = (props: GuessScreenSkeletonProps): JSX.Element => {
  const { playerCount = 0, dictionaryName = 'main' } = props;
  const width = 295;

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

        <zstack height="100%" width="100%">
          <vstack height="100%" width="100%" alignment="center middle">
            <Drawing data={props.drawing} size={width} shadowOffset={8} />
            <spacer height="8px" />
            <HeroButton label="LOADING ..." />
            <spacer height="16px" />

            {/* Metadata */}
            <PixelText color={Settings.theme.secondary}>
              {playerCount > 0
                ? `${playerCount.toLocaleString()} have guessed`
                : 'Make the first guess!'}
            </PixelText>
          </vstack>

          {/* Overlay */}
          <vstack height="100%" width="100%" alignment="center top">
            <spacer height="16px" />

            {/* Dictionary */}
            {dictionaryName && dictionaryName !== 'main' && (
              <hstack alignment="middle center">
                <image
                  url={`data:image/svg+xml,
                <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 4H4V6H2V8H0V12H2V14H6V12H8V10H10V8H12V6H14V0H8V2H6V4ZM10 2H12V4H10V2Z" fill="${Settings.theme.secondary}" />
</svg>
                `}
                  imageHeight={14}
                  imageWidth={14}
                  height="14px"
                  width="14px"
                />
                <spacer width="8px" />
                <PixelText
                  color={Settings.theme.secondary}
                >{`${dictionaryName} ${dictionaryName.startsWith('r/') ? 'takeover' : 'event'}`}</PixelText>
              </hstack>
            )}
          </vstack>
        </zstack>
      </zstack>
    </blocks>
  );
};
