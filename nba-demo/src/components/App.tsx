import { Devvit } from '@devvit/public-api';
import { StatusBar } from './StatusBar.js';
import { Score } from './Score.js';
import { PlayGallery } from './PlayGallery.js';
import { CheerBar } from './CheerBar.js';
import { Dimensions } from '../types.js';
import { NBATeamCode, NBA_TEAM_INFO } from '../const.js';
import { selectWeightedOption } from '../utils/utils.js';

const CHEER_STEP = 250;

type Team = {
  code: NBATeamCode;
  cheers: number;
  score: number;
};

export type GameState = {
  teamA: Team;
  teamB: Team;
};

const initialGameState: GameState = {
  teamA: {
    cheers: 1234,
    code: 'ny',
    score: 0,
  },
  teamB: {
    cheers: 2345,
    code: 'gs',
    score: 0,
  },
};

type AppState = {
  current: GameState;
  previous: GameState;
};

const initialAppState: AppState = {
  current: initialGameState,
  previous: initialGameState,
};

export const App: Devvit.CustomPostComponent = ({ useState }) => {
  /**
   * We prop drill here because there's a rumor of useDimensions landing in a
   * few weeks. Hopefully this interface is right! These are pixels, but return
   * numbers because we do math to compute things!
   */
  const dimensions: Dimensions = { width: 750, height: 320 };
  /**
   * Why a god object?
   *
   * Well, there's no batching in event handlers so every state setter is another
   * rerender and since there's no partial rerendering it's pretty bad for performance. So by
   * using this god object thingy we can ensure there's only one re-render.
   */
  const [appState, setAppState] = useState(initialAppState);
  const teamAInfo = NBA_TEAM_INFO[appState.current.teamA.code];
  const teamBInfo = NBA_TEAM_INFO[appState.current.teamB.code];

  const updateStateForTeam = <T extends keyof Team>(
    team: keyof GameState,
    key: T,
    value: Team[T]
  ): void => {
    setAppState((x) => {
      return {
        ...x,
        current: {
          ...x.current,
          [team]: {
            ...x.current[team],
            [key]: value,
          },
        },
        previous: { ...x.current },
      };
    });
  };

  console.log(JSON.stringify(appState, null, 2));

  const onCheer = (team: keyof GameState): void => {
    updateStateForTeam(team, 'cheers', appState.current[team].cheers + CHEER_STEP);
  };

  const onScore = (team: keyof GameState): void => {
    // TODO: Could be 1, 2, or 3
    updateStateForTeam(
      team,
      'score',
      appState.current[team].score +
        selectWeightedOption([
          { value: 1, weight: 10 },
          { value: 2, weight: 60 },
          { value: 3, weight: 30 },
        ])
    );
  };

  const debugRow = (
    <hstack>
      <button size="small" appearance="primary" onPress={() => onScore('teamA')}>
        Score A
      </button>
      <button size="small" appearance="primary" onPress={() => onScore('teamB')}>
        Score B
      </button>
    </hstack>
  );

  return (
    <blocks height="regular">
      <zstack width={100} height={100} grow>
        <vstack width={100} height={100} backgroundColor="#223337"></vstack>

        <vstack
          width={`${dimensions.width}px`}
          height={`${dimensions.height}px`}
          alignment="center middle"
        >
          <vstack width={100} height={100}>
            <StatusBar
              gamePhase="Q1"
              timeLeftFormatted="1:20"
              additionalTimeFormatted=":23"
              isLive={true}
            />
            <vstack width={100} grow padding="medium">
              <Score
                currentGameState={appState.current}
                previousGameState={appState.previous}
                dimensions={dimensions}
                teamAInfo={teamAInfo}
                teamBInfo={teamBInfo}
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
                currentGameState={appState.current}
                previousGameState={appState.previous}
                dimensions={dimensions}
                teamAInfo={teamAInfo}
                teamBInfo={teamBInfo}
                onTeamACheerClicked={() => onCheer('teamA')}
                onTeamBCheerClicked={() => onCheer('teamB')}
              />
            </vstack>
          </vstack>
        </vstack>
        {debugRow}
      </zstack>
    </blocks>
  );
};
