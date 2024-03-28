import { Devvit } from '@devvit/public-api';
import type { NavigateToPage } from './Scoreboard.js';
import { ScoreboardColor, ScoreboardPage } from './Scoreboard.js';

export type SettingsPageProps = {
  navigateToPage: NavigateToPage;
  spoilerFreeSetting: boolean;
  onSpoilerFreeToggle: () => Promise<void>;
};

export function SettingsPage(props: SettingsPageProps): JSX.Element {
  return (
    <vstack width={'100%'} height={'100%'}>
      <zstack width={'100%'} height={'64px'} backgroundColor={ScoreboardColor.transparentHeader}>
        <hstack width={'100%'} height={'100%'} alignment="start middle" padding="small">
          <spacer size="small" />
          <text style="heading" size="xlarge" color={ScoreboardColor.primaryFont}>
            Settings
          </text>
        </hstack>
        <hstack width={'100%'} height={'100%'} alignment="end middle" padding="small">
          <icon
            name="close-fill"
            color={ScoreboardColor.primaryFont}
            onPress={() => props.navigateToPage(ScoreboardPage.SCORE)}
          />
          <spacer size="small" />
        </hstack>
      </zstack>

      <hstack width={'100%'} height={'96px'}>
        <vstack width={'65%'} height={'100%'} alignment="start middle" padding="medium">
          <text style="heading" size="large" color={ScoreboardColor.primaryFont}>
            Hide Scores
          </text>
          <text style="metadata" grow width={'100%'} color={ScoreboardColor.secondaryFont} wrap>
            Enable this setting to hide scores by default on all scoreboard posts
          </text>
        </vstack>
        <vstack width={'35%'} height={'100%'} alignment="end top" padding="medium">
          <button onPress={() => props.onSpoilerFreeToggle()}>
            {props.spoilerFreeSetting ? 'Show' : 'Hide'}
          </button>
        </vstack>
      </hstack>
    </vstack>
  );
}
