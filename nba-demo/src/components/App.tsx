import { Devvit } from '@devvit/public-api';
import { StatusBar } from './StatusBar.js';
import { Score } from './Score.js';
import { PlayGallery } from './PlayGallery.js';
import { CheerBar } from './CheerBar.js';

export const App = () => {
  return (
    <blocks height="regular">
      <zstack width="100%" height="100%">
        <vstack width={100} height={100} backgroundColor="#223337"></vstack>
        <vstack width={100} height={100}>
          <StatusBar
            gamePhase="Q1"
            timeLeftFormatted="1:20"
            additionalTimeFormatted=":23"
            isLive={true}
          />
          <vstack width={100} grow padding="medium">
            <Score
              teamA={{ name: 'Houston Astros', score: 1, logo: 'team-logos/mlb-hou.png' }}
              teamB={{
                name: 'Los Angeles Lakers',
                score: 0,
                logo: 'team-logos/mlb-lakers.png',
              }}
            />
            <spacer size="small" grow />
            <PlayGallery
              currentPlay={{
                title: 'Latest play (12:00)',
                text: 'Jericho Sims vs Anthony Davis (Donte DiVincenzo gains possession) and the game is now completely insane and long to wrap the text',
              }}
              onPreviousPlayNavigation={() => {}}
            />
            <spacer size="small" grow />
            <CheerBar
              teamACheers={6102}
              teamBCheers={4269}
              teamAColor="#f48328"
              teamBColor="#552584"
            />
          </vstack>
        </vstack>
      </zstack>
    </blocks>
  );
};
