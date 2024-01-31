import { Devvit, svg } from '@devvit/public-api';
import { TeamInfo } from '../const.js';
import { Dimensions } from '../types.js';
import { GameState } from './App.js';
import { generateRandomHash } from '../utils/utils.js';

type ScoreProps = {
  currentGameState: GameState;
  previousGameState: GameState;
  dimensions: Dimensions;
  teamAInfo: TeamInfo;
  teamBInfo: TeamInfo;
};

type ScoreNumberProps = {
  currentScore: number;
  previousScore: number;
  /**
   * A unique ID given for a render. See, since we're in a data URL the browser makes a
   * network request to get this thing we're constructing. So let's say Team A does this:
   *
   * 0-3: animate
   * 3-6: animate
   * 6-9: animate
   * 9-12: animate
   *
   * Now, team B wants to play and starts scoring. The data URL for all these transitions
   * between points have been attempted before. That means the browser will be smart and
   * serve a cached data url (it is, an image after all and who would ever attempt to
   * write animations in them). We would, that's who.
   *
   * That means we have to make every single data URL different to bust the chrome cache
   * to keep this grand illusion alive.
   */
  id: string;
  /**
   * The animation varies depending on if you are on the left or right of the screen
   */
  variant: 'left' | 'right';
};

const ScoreNumber = ({
  currentScore,
  previousScore,
  id,
  variant,
}: ScoreNumberProps): JSX.Element => {
  /**
   * Since we can't rely on browser caching for the animation stuff we need to add a flag
   * here to explicity tell the constructed image to animate or not.
   */
  const shouldAnimate = currentScore !== previousScore;

  /**
   * If you change the font size please edit the estimated digit width as well. It's more of an art than a science
   * when you're this deep.
   */
  const fontSize = 48;
  const estimatedDigitWidth = 30;

  const width = 110;
  const height = 56;
  // There's a little weirdness at 9-10 and 99-100 but I'm not sure how to really fix it since we are
  // using css keyframes. This only affects teamB.
  const x = variant === 'left' ? 0 : width - currentScore.toString().length * estimatedDigitWidth;

  /**
   * It's not a perfect science on how to get the text vertical position perfectly at the bottom of the svg.
   * We need it to be near perfect because the scale needs to be within the total height of the image other you
   * get some nasty clipping. We are inside of a background-image css tag, after all!
   */
  const yShimmy = 10;
  const y = height / 2 + yShimmy;
  return (
    <image
      imageHeight={height}
      imageWidth={width}
      // All data url stuff inside must be double quotes because it is not escaped right for some reason!
      // This is a subsetted font from Google Fonts running inside of SVG
      url={svg`<svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewbox="0 0 ${width} ${height}" width="${width}" height="${height}">
            <style>
              @keyframes grow {
                from { opacity: 1; scale: 1; }
                to { opacity: 0; scale: 1.2; }
              }

              @keyframes shrink {
                from { opacity: 0; scale: 1.2; }
                to { opacity: 1; scale: 1;}
              }

              .number {
                font-family: "SF Pro";
                font-size: ${fontSize}px;
                line-height: ${fontSize}px;
                font-weight: 700;
                letter-spacing: -0.4px;
                fill: #F2F4F5;
                transform-origin: ${variant === 'left' ? 'left bottom' : 'right bottom'};
              }

              .num1 {
                animation: grow 0.2s forwards;
              }

              .num2 {
                animation: shrink 0.2s forwards;
                animation-delay: 0.2s;
                opacity: 0;
              }
            </style>

            <text class="number ${
              shouldAnimate ? 'num1' : ''
            }" x="${x}" y="${y}" dominant-baseline="middle">${previousScore}</text>
            <text class="number ${
              shouldAnimate ? 'num2' : ''
            }" x="${x}" y="${y}" dominant-baseline="middle">${currentScore}</text>
          </svg>`}
    ></image>
  );
};

export function Score({
  currentGameState,
  dimensions,
  previousGameState,
  teamAInfo,
  teamBInfo,
}: ScoreProps): JSX.Element {
  return (
    <hstack width={100} height="88px">
      <hstack width={50} alignment="start middle">
        <image
          height={'88px'}
          width={'88px'}
          imageWidth={'128px'}
          imageHeight={'128px'}
          url={teamAInfo.logo}
          resizeMode="fill"
        />
        <spacer size="small" />
        <vstack alignment="middle start">
          <ScoreNumber
            id={generateRandomHash(32)}
            currentScore={currentGameState.teamA.score}
            previousScore={previousGameState.teamA.score}
            variant="left"
          />
          <text color="#f3f4f5" size="xlarge">
            {teamAInfo.name.toUpperCase()}
          </text>
        </vstack>
      </hstack>
      <hstack width={50} alignment="end middle">
        <vstack alignment="middle end">
          <ScoreNumber
            id={generateRandomHash(32)}
            currentScore={currentGameState.teamB.score}
            previousScore={previousGameState.teamB.score}
            variant="right"
          />
          <text color="#f3f4f5" size="xlarge">
            {teamBInfo.name.toUpperCase()}
          </text>
        </vstack>
        <spacer size="small" />
        <image
          height={'88px'}
          width={'88px'}
          imageWidth={'128px'}
          imageHeight={'128px'}
          url={teamBInfo.logo}
          resizeMode="fill"
        />
      </hstack>
    </hstack>
  );
}
