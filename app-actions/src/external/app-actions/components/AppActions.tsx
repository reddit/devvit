import { Devvit } from '@devvit/public-api';
import { canSeeToolbar, validateUserAllowlist } from '../utils/utils.js';
import type { DevToolbarAction } from '../types.js';
import { SettingsCroppedIcon } from './SettingsCroppedIcon.js';
import { CloseCroppedIcon } from './CloseCroppedIcon.js';

const UppercaseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type AppActionsProps = Devvit.BlockComponentProps<{
  context: Devvit.Context;
  actions: DevToolbarAction[];
  /* Space separated list of usernames that can see the developer panel */
  allowedUserString?: string;
}>;

export const ActionToolbarWrapper = (props: AppActionsProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = props.context.useState<boolean>(false);
  const allowedUserString: string =
    validateUserAllowlist(props.allowedUserString) === undefined ? props.allowedUserString! : '';

  const [currentUserName] = props.context.useState<string | undefined>(async () => {
    const currentUserId = props.context.userId;
    if (!currentUserId) {
      return undefined;
    }
    const currentUser = await props.context.reddit.getUserById(currentUserId);
    return currentUser?.username;
  });

  const isDevMode = canSeeToolbar(allowedUserString, currentUserName);

  return (
    <zstack width="100%" height="100%">
      {props.children ?? null}
      {isDevMode ? (
        <AppActionsRow
          expanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          actions={props.actions}
        />
      ) : null}
    </zstack>
  );
};

function getActionLabel(index: number): string {
  const labelLetter = UppercaseAlphabet[index % UppercaseAlphabet.length];
  const labelNumber = Math.floor(index / UppercaseAlphabet.length);
  return `${labelLetter}${labelNumber}`;
}

const AppActionsRow = (props: {
  expanded: boolean;
  onToggleExpanded: () => void;
  actions: { run: () => void; label?: string }[];
}): JSX.Element => {
  if (!props.expanded) {
    return (
      <hstack width="100%" alignment="middle end">
        <vstack>
          <spacer size="small" />
          <SettingsCroppedIcon onPress={props.onToggleExpanded} />
        </vstack>
      </hstack>
    );
  }

  return (
    <hstack width="100%" alignment="middle end">
      <vstack>
        <spacer size="small" />
        <hstack>
          <spacer size="small" grow />
          <hstack backgroundColor="#000000CC" cornerRadius="medium" alignment="center middle">
            <spacer size="medium" />
            {props.actions.map((action, index) => {
              return (
                <>
                  {index !== 0 && <spacer size="medium" />}
                  <hstack minWidth="16px">
                    <text color="#fff" weight="bold" style="metadata" onPress={action.run}>
                      {action.label || getActionLabel(index)}
                    </text>
                  </hstack>
                </>
              );
            })}
            <spacer size="medium" />
          </hstack>
          <spacer size="small" />
          <CloseCroppedIcon onPress={props.onToggleExpanded} />
        </hstack>
      </vstack>
    </hstack>
  );
};
