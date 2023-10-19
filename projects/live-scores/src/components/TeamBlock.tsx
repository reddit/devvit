import { Devvit } from '@devvit/public-api';
import { GENERIC_TEAM_COLOR_MAP } from '../sports/ColorMaps.js';
import { TeamBlockBaseball, sportSpecificContentBaseball } from './baseball.js';
import { TeamBlockBasketball, sportSpecificContentBasketball } from './basketball.js';
import { EventState } from '../sports/GameModels.js';

export function TeamBlock({
  isHomeTeam,
  name,
  logo,
  color,
  score,
  state,
  baseballProps,
  basketballProps,
}: {
  isHomeTeam: boolean;
  name: string;
  logo: string;
  color?: string;
  score?: number;
  state: EventState;
  baseballProps?: TeamBlockBaseball;
  basketballProps?: TeamBlockBasketball;
}): JSX.Element {
  const logoEl = (
    <hstack cornerRadius="full" padding="small" backgroundColor="white">
      <image url={logo} imageHeight={64} imageWidth={64} />
    </hstack>
  );
  const scoreEl = (
    <text color="white" size="xxlarge">
      {state === EventState.PRE ? '-' : score?.toString()}
    </text>
  );

  let backgroundColor = color;
  if (backgroundColor === undefined) {
    backgroundColor = isHomeTeam ? GENERIC_TEAM_COLOR_MAP['home'] : GENERIC_TEAM_COLOR_MAP['away'];
  }

  const alignment = !isHomeTeam ? 'start' : 'end';

  let sportSpecificContent;

  if (baseballProps) {
    sportSpecificContent = sportSpecificContentBaseball(state, baseballProps);
  } else if (basketballProps) {
    sportSpecificContent = sportSpecificContentBasketball(state, isHomeTeam, basketballProps);
  }

  return (
    <vstack padding="medium" width={'50%'} backgroundColor={backgroundColor} alignment={alignment}>
      <text alignment={alignment} size="small" color="white" height={baseballProps ? 16 : 10}>
        {name.toUpperCase()} {isHomeTeam ? '(HOME)' : '(AWAY)'}
      </text>
      <spacer size="small" />
      <hstack alignment={!isHomeTeam ? 'middle' : 'middle end'}>
        {!isHomeTeam ? logoEl : scoreEl}
        <spacer size="medium" />
        {!isHomeTeam ? scoreEl : logoEl}
      </hstack>
      <spacer size="small" />
      {sportSpecificContent}
      <spacer size="large" />
    </vstack>
  );
}
