import { Devvit, svg } from '@devvit/public-api';
import { TeamInfo } from '../const.js';
import { generateKeyframes, presets } from '../utils/keyframes.js';
import { Dimensions } from '../types.js';
import { GameState } from './App.js';

type CheerBarProps = {
  currentGameState: GameState;
  previousGameState: GameState;
  onTeamACheerClicked: () => void;
  onTeamBCheerClicked: () => void;
  dimensions: Dimensions;
  teamAInfo: TeamInfo;
  teamBInfo: TeamInfo;
};

const computeCheerMeterFill = (cheersA: number, cheersB: number): number => {
  return Math.round((cheersA / (cheersA + cheersB)) * 100);
};

export function CheerBar({
  currentGameState,
  previousGameState,
  onTeamACheerClicked,
  onTeamBCheerClicked,
  dimensions,
  teamAInfo,
  teamBInfo,
}: CheerBarProps): JSX.Element {
  const HEIGHT = 44;
  const WIDTH = dimensions.width - 20;

  const previousCheerMeterValue = computeCheerMeterFill(
    previousGameState.teamA.cheers,
    previousGameState.teamB.cheers
  );
  const currentCheerMeterValue = computeCheerMeterFill(
    currentGameState.teamA.cheers,
    currentGameState.teamB.cheers
  );

  const widthKeyframes = generateKeyframes([
    {
      ...presets.wobbly,
      from: previousCheerMeterValue,
      to: currentCheerMeterValue,
      unit: '%',
      property: 'width',
    },
  ]);

  return (
    <zstack width={100} cornerRadius="large">
      <image
        imageHeight={HEIGHT}
        imageWidth={WIDTH}
        url={svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">
              <style>
                @keyframes bouncyProgress {
                  ${widthKeyframes}
                }
      
                .data {
                  animation: bouncyProgress 2s ease-in-out;
                }
              </style>
              <g class="bars">
                <rect class="bg" fill="${teamBInfo.color}" width="100%" height="${HEIGHT}"></rect>
                <rect class="data" fill="${teamAInfo.color}" width="${currentCheerMeterValue}%" height="${HEIGHT}"></rect>
              </g>
           </svg>
           `}
      ></image>
      <hstack>
        <hstack
          backgroundColor="red"
          cornerRadius="large"
          height={`${HEIGHT}px`}
          width={'100px'}
          alignment="middle start"
          onPress={onTeamACheerClicked}
          padding="medium"
          gap="small"
        >
          <image imageHeight={24} imageWidth={24} url="knicks_horn.png" />
          <text weight="bold">Cheer</text>
        </hstack>
      </hstack>
      <hstack width={100} alignment="middle end">
        <hstack
          backgroundColor="red"
          cornerRadius="large"
          height={`${HEIGHT}px`}
          width={'100px'}
          alignment="middle end"
          onPress={onTeamBCheerClicked}
          padding="medium"
          gap="small"
        >
          <text weight="bold">Cheer</text>
          <image imageHeight={24} imageWidth={24} url="warriors_horn.png" />
        </hstack>
      </hstack>
    </zstack>
  );
}
