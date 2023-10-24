import { Devvit } from '@devvit/public-api';
import { TeamBlock } from './TeamBlock.js';
import { TopBar } from './TopBar.js';
import { CommentData, CommentBlock } from './comments.js';
import { GeneralGameScoreInfo } from '../sports/GameEvent.js';

export function GenericScoreBoard(
  scoreInfo: GeneralGameScoreInfo,
  lastComment: CommentData
): JSX.Element {
  return (
    <blocks height="regular">
      <vstack cornerRadius="medium" grow>
        {TopBar({
          state: scoreInfo.event.state,
          date: scoreInfo.event.date,
          event: scoreInfo.event,
        })}
        <zstack grow width={100}>
          <vstack width={'100%'} height={'100%'}>
            {TeamBlock({
              isHomeTeam: false,
              name: scoreInfo.event.awayTeam.fullName,
              logo: scoreInfo.event.awayTeam.logo,
              score: scoreInfo.awayScore,
              state: scoreInfo.event.state,
            })}
            <hstack border="thin" />
            {TeamBlock({
              isHomeTeam: true,
              name: scoreInfo.event.homeTeam.fullName,
              logo: scoreInfo.event.homeTeam.logo,
              score: scoreInfo.homeScore,
              state: scoreInfo.event.state,
            })}
          </vstack>
          {CommentBlock({
            username: lastComment.username,
            commentBody: lastComment.text,
          })}
        </zstack>
      </vstack>
    </blocks>
  );
}
