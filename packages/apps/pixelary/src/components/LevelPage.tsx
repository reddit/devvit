import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import Levels from '../data/levels.json';
import Settings from '../settings.json';
import { Level } from '../types/Level.js';
import type { UserData } from '../types/UserData.js';
import { abbreviateNumber } from '../utils/abbreviateNumber.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';
import { ProgressBar } from './ProgressBar.js';
import { StyledButton } from './StyledButton.js';

interface LevelPageProps {
  userData: UserData;
  user: {
    rank: number;
    score: number;
  };
  percentage: number;
  level: Level;
  onClose: () => void;
}

export const LevelPage = (props: LevelPageProps, context: Context): JSX.Element => {
  const [level, setLevel] = useState<number>(props.level.rank);
  const currentLevel = Levels[level - 1] as Level;

  // Rendering flags
  const isCurrentLevel = level === props.level.rank;
  const isFutureLevel = props.level.rank >= level;

  return (
    <vstack width="100%" height="100%">
      <spacer height="24px" />

      <hstack grow>
        <spacer width="24px" />
        <zstack alignment="start top" grow>
          {/* Shadow */}
          <vstack width="100%" height="100%">
            <spacer height="4px" />
            <hstack grow>
              <spacer width="4px" />
              <hstack grow backgroundColor={Settings.theme.shadow} />
            </hstack>
          </vstack>

          {/* Card */}
          <vstack width="100%" height="100%">
            <hstack grow>
              <vstack grow backgroundColor="white">
                <spacer height="24px" />
                <vstack grow alignment="start top">
                  {/* Header */}
                  <hstack width="100%" alignment="top">
                    <spacer width="24px" />
                    <vstack>
                      <PixelText scale={2} color={Settings.theme.tertiary}>
                        {`Level ${currentLevel.rank}`}
                      </PixelText>
                      <spacer height="8px" />
                      <PixelText scale={3} color={Settings.theme.primary}>
                        {currentLevel.name}
                      </PixelText>
                    </vstack>
                    <spacer grow />
                    <StyledButton
                      appearance="primary"
                      label="x"
                      width="32px"
                      height="32px"
                      onPress={props.onClose}
                    />
                    <spacer width="20px" />
                  </hstack>
                  <spacer height="20px" />

                  {/* Progress Bar */}
                  <vstack width="100%" alignment="center middle">
                    <ProgressBar
                      percentage={isCurrentLevel ? props.percentage : isFutureLevel ? 100 : 0}
                      width={context?.dimensions?.width ? context.dimensions.width - 96 : 295}
                    />
                    <spacer height="8px" />
                    <hstack width="100%">
                      <spacer width="24px" />
                      {/* From */}
                      <PixelText
                        scale={2}
                        color={
                          isCurrentLevel
                            ? Settings.theme.primary
                            : isFutureLevel
                              ? Settings.theme.primary
                              : 'rgba(0,0,0,0.4)'
                        }
                      >
                        {abbreviateNumber(currentLevel.min)}
                      </PixelText>

                      {/* Current */}
                      {isCurrentLevel && (
                        <>
                          <spacer grow />
                          <PixelText scale={2} color={Settings.theme.orangered}>
                            {`${abbreviateNumber(props.user.score)} (${props.percentage}%)`}
                          </PixelText>
                        </>
                      )}
                      <spacer grow />
                      {/* To */}
                      <PixelText
                        scale={2}
                        color={
                          isCurrentLevel
                            ? 'rgba(0,0,0,0.4)'
                            : isFutureLevel
                              ? Settings.theme.primary
                              : 'rgba(0,0,0,0.4)'
                        }
                      >
                        {abbreviateNumber(currentLevel.max)}
                      </PixelText>
                      <spacer width="24px" />
                    </hstack>
                  </vstack>
                  <spacer height="48px" />

                  {/* Rewards */}
                  <hstack width="100%">
                    <spacer width="24px" />
                    <vstack grow alignment="top start">
                      <PixelText scale={2} color={Settings.theme.primary}>
                        Rewards:
                      </PixelText>
                      <spacer height="24px" />

                      {/* Extra Time */}
                      <hstack>
                        <PixelSymbol
                          type="checkmark"
                          scale={2}
                          color={
                            props.level.rank < level ? 'rgba(0,0,0,0.2)' : Settings.theme.orangered
                          }
                        />
                        <spacer width="12px" />
                        <vstack>
                          <PixelText scale={2} color={Settings.theme.secondary}>
                            {`${currentLevel.extraTime} extra seconds`}
                          </PixelText>
                          <spacer height="4px" />
                          <PixelText scale={2} color={Settings.theme.secondary}>
                            when drawing
                          </PixelText>
                        </vstack>
                      </hstack>
                      <spacer height="24px" />

                      {/* Flair */}
                      <hstack>
                        <PixelSymbol
                          type="checkmark"
                          scale={2}
                          color={
                            props.level.rank < level ? 'rgba(0,0,0,0.2)' : Settings.theme.orangered
                          }
                        />
                        <spacer width="12px" />
                        <PixelText scale={2} color={Settings.theme.secondary}>
                          Exclusive flair
                        </PixelText>
                      </hstack>
                    </vstack>
                    <spacer width="24px" />
                  </hstack>
                  <spacer grow />

                  {/* Pagination Buttons */}
                  <hstack width="100%">
                    <spacer width="24px" />
                    {level > 1 && (
                      <StyledButton
                        appearance="primary"
                        leadingIcon="arrow-left"
                        width="32px"
                        height="32px"
                        onPress={() => setLevel(level - 1)}
                      />
                    )}
                    <spacer grow />
                    {level < Levels.length && (
                      <StyledButton
                        appearance="primary"
                        leadingIcon="arrow-right"
                        width="32px"
                        height="32px"
                        onPress={() => setLevel(level + 1)}
                      />
                    )}
                    <spacer width="20px" />
                  </hstack>

                  {/* End of card content */}
                </vstack>
                <spacer height="20px" />
              </vstack>
              <spacer width="4px" />
            </hstack>
            <spacer height="4px" />
          </vstack>
        </zstack>
        <spacer width="20px" />
      </hstack>

      <spacer height="20px" />
    </vstack>
  );
};
