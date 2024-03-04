import { Devvit } from '@devvit/public-api';
import type { GameEvent } from '../sports/GameEvent.js';
import { EventState } from '../sports/GameEvent.js';
import { eventPeriodString } from '../sports/espn/espn.js';
import type { TopBarBaseball } from './baseball.js';
import { topBarBaseballComponent } from './baseball.js';
import type { TopBarBasketball } from './basketball.js';
import { topBarBasketballComponent } from './basketball.js';

export function msToHMS(ms: number): string {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  const hours = Math.trunc(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours

  if (hours > 24) {
    const days = Math.trunc(hours / 24);
    const shortHours = hours % 24;
    return `${days}d ${shortHours}h`;
  }

  // 3- Extract minutes:
  const minutes = Math.trunc(seconds / 60).toString(); // 60 seconds in 1 minute
  return `${hours}h ${minutes}m`;
}

export function Live(): JSX.Element {
  return (
    <hstack backgroundColor="#FF4500" cornerRadius="full" padding="xsmall">
      <spacer size="small" />
      <text color="white">Live</text>
      <spacer size="small" />
    </hstack>
  );
}

export function Offline(): JSX.Element {
  return (
    <hstack backgroundColor="#82959B" cornerRadius="full" padding="xsmall">
      <spacer size="small" />
      <text color="white">Offline</text>
      <spacer size="small" />
    </hstack>
  );
}

export function TopBar({
  baseballProps,
  basketBallProps,
  event,
  color,
  height,
  isOnline,
}: {
  baseballProps?: TopBarBaseball;
  basketBallProps?: TopBarBasketball;
  event: GameEvent;
  color?: string;
  height?: Devvit.Blocks.SizeString;
  isOnline: boolean;
}): JSX.Element {
  const state = event.state;
  const date = event.date;
  const backgroundColor = color ?? 'alienblue-700';
  const barHeight = height ?? '58px';
  if (state === EventState.PRE && date) {
    const gameTime = new Date(date).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = gameTime - currentTime;

    return (
      <hstack
        height={barHeight}
        padding="medium"
        backgroundColor={backgroundColor}
        alignment="center middle"
      >
        <text color="white" style="heading">
          {timeDifference > 0 ? `Starting in ${msToHMS(gameTime - currentTime)}` : 'Starting soon'}{' '}
          ...
        </text>
      </hstack>
    );
  } else if (state === EventState.FINAL) {
    return (
      <hstack
        height={barHeight}
        padding="medium"
        backgroundColor={backgroundColor}
        alignment="center middle"
      >
        <text color="white" style="heading">
          Game has ended
        </text>
      </hstack>
    );
  } else if (baseballProps) {
    return topBarBaseballComponent(baseballProps);
  } else if (basketBallProps) {
    return topBarBasketballComponent(basketBallProps);
  } else if (event.timingInfo) {
    const { displayClock, period } = event.timingInfo;
    return (
      <hstack
        height={barHeight}
        width={'100%'}
        padding="medium"
        backgroundColor={backgroundColor}
        alignment="center middle"
      >
        <hstack alignment="start" grow>
          <vstack>
            <text color="white" style="heading">
              {displayClock}
            </text>
            {event.gameType !== 'soccer' && (
              <text color="white" style="body">
                {eventPeriodString(period, event.gameType)}
              </text>
            )}
          </vstack>
        </hstack>
        <hstack alignment="end" grow>
          {isOnline ? Live() : Offline()}
        </hstack>
      </hstack>
    );
  }
  return null;
}
