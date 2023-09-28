import { Devvit } from '@devvit/public-api';
import { EventState, GameEvent, eventPeriodNumber, eventPeriodToString } from '../espn.js';
import { TopBarBaseball, topBarBaseballComponent } from './baseball.js';
import { TopBarBasketball, topBarBasketballComponent } from './basketball.js';

function msToHMS(ms: number): string {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  const hours = Math.trunc(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = Math.trunc(seconds / 60).toString(); // 60 seconds in 1 minute
  return `${hours}:${minutes.length === 1 ? '0' + minutes : minutes}`;
}

export function Live(): JSX.Element {
  return (
    <hstack backgroundColor="#FF4500" cornerRadius="medium" padding="xsmall">
      <spacer size="small" />
      <text color="white">Live</text>
      <spacer size="small" />
    </hstack>
  );
}

export function TopBar({
  baseballProps,
  basketBallProps,
  date,
  state,
  event,
}: {
  baseballProps?: TopBarBaseball;
  basketBallProps?: TopBarBasketball;
  date?: string;
  state: EventState;
  event: GameEvent;
}): JSX.Element {
  if (state === EventState.PRE && date) {
    const gameTime = new Date(date).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = gameTime - currentTime;
    return (
      <hstack padding="medium" backgroundColor="black" alignment="center middle">
        <text color="white" style="heading">
          {timeDifference > 0 ? `Starting in ${msToHMS(gameTime - currentTime)}` : 'Starting soon'}{' '}
          ...
        </text>
      </hstack>
    );
  } else if (state === EventState.FINAL) {
    return (
      <hstack padding="medium" backgroundColor="black" alignment="center middle">
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
      <hstack padding="medium" backgroundColor="black" alignment="center middle">
        <hstack alignment="start" grow>
          <vstack>
            <text color="white" style="heading">
              {displayClock}
            </text>
            <text color="white" style="body">
              {eventPeriodNumber(period)} {eventPeriodToString(event.gameType)}
            </text>
          </vstack>
        </hstack>
        <hstack alignment="end" grow>
          {Live()}
        </hstack>
      </hstack>
    );
  }
}
