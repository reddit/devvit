import { Devvit } from '@devvit/public-api';

import { EventState } from '../sports/GameEvent.js';
import { formatAsFirstLastName, SoccerGameScoreInfo } from '../sports/sportradar/SoccerEvent.js';

export type EventBubbleStrings = {
  primaryString?: string;
  secondaryString?: string;
};

export function stringsForLatestEvent(scoreInfo?: SoccerGameScoreInfo): EventBubbleStrings {
  let primaryString: string | undefined;
  let secondaryString: string | undefined;
  if (scoreInfo?.event.state === EventState.FINAL) {
    primaryString = `📣 Game has ended`;
    secondaryString = `Join the discussion in the comments!`;
  } else if (scoreInfo?.summary?.latestEvent) {
    const timelineEvent = scoreInfo.summary.latestEvent;
    const matchTime = timelineEvent.match_time;
    const stoppageTime = timelineEvent.stoppage_time;
    const timeString = `${matchTime ?? ``}’${stoppageTime ? `+${stoppageTime}’` : ``}`;
    if (timelineEvent.type === `score_change`) {
      const isHomeTeam = timelineEvent.competitor === `home`;
      const teamName = isHomeTeam
        ? scoreInfo.event.homeTeam.fullName
        : scoreInfo.event.awayTeam.fullName;
      primaryString = `⚽︎ Goal ${teamName} (${timeString})`;
      if (timelineEvent.commentaries) {
        secondaryString = timelineEvent.commentaries[0].text;
      } else if (timelineEvent.players) {
        const name = formatAsFirstLastName(timelineEvent.players[0].name);
        secondaryString = `Scored by ${name}`;
      }
    } else {
      if (timelineEvent.commentaries) {
        primaryString = `📣 Latest update ${matchTime ? `(${timeString})` : ``}`;
        secondaryString = timelineEvent.commentaries[0].text;
      }
    }
  }
  return { primaryString, secondaryString };
}

export function Bubble(scoreInfo?: SoccerGameScoreInfo): JSX.Element {
  let { primaryString, secondaryString } = stringsForLatestEvent(scoreInfo);

  if (!primaryString && !secondaryString) {
    primaryString = `✨ New! Stats and lineup`;
    secondaryString = `Click a team anytime to view details`;
  }

  return (
    <hstack
      // The full width container
      width="100%"
      height="25%"
      alignment="middle center"
      padding="small"
    >
      <vstack
        // The rounded bubble container
        width="100%"
        height="100%"
        alignment="middle start"
        border="thin"
        cornerRadius="full"
        borderColor="alienblue-600"
      >
        <hstack
          // Left to right content text + cheer button including space
          width="100%"
        >
          <spacer size="medium" />
          <vstack
            // VStack of primary and secondary text
            alignment="start middle"
            grow
          >
            {primaryString ? (
              <text size="medium" weight="bold">
                {primaryString}
              </text>
            ) : null}
            {secondaryString ? <text size="small">{secondaryString}</text> : null}
          </vstack>
          {/* <button appearance="primary">Cheer!</button> */}
          <spacer size="small" />
        </hstack>
      </vstack>
    </hstack>
  );
}
