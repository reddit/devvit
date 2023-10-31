import { Devvit } from '@devvit/public-api';

type AutoUpdateProps = {
  initialPostTime?: Date | undefined;
  liveRenderTime?: Date | undefined;
  schedulerUpdateTime?: Date | undefined;
  lastScheduledUpdateTime?: Date | undefined;
  isMod: boolean;
  updating?: boolean | undefined;
  toggleAutoUpdate?: (() => Promise<void>) | undefined;
  forceUpdate?: (() => Promise<void>) | undefined;
  autoUpdateEnabled: boolean;
  toggleModActions?: (() => void) | undefined;
  showModActions?: boolean;
};

export const AutoUpdate = ({
  initialPostTime,
  liveRenderTime,
  schedulerUpdateTime,
  isMod,
  updating,
  toggleAutoUpdate,
  forceUpdate,
  autoUpdateEnabled,
  lastScheduledUpdateTime,
  toggleModActions,
  showModActions,
}: AutoUpdateProps) => {
  let action = 'Initial post';
  let date = initialPostTime;
  if (liveRenderTime) {
    action = 'Live render';
    date = liveRenderTime;
  } else if (schedulerUpdateTime) {
    action = 'Scheduled update';
    date = schedulerUpdateTime;
  }

  const dateString = (d: Date) =>
    d?.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      hour12: true,
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Los_Angeles',
    });

  const modActions =
    isMod && showModActions ? (
      <>
        <hstack gap={'small'} alignment={'middle'}>
          <text>Mod Actions:</text>
          <button
            disabled={updating}
            onPress={() => toggleAutoUpdate?.()}
            appearance={'destructive'}
          >
            {autoUpdateEnabled ? 'Stop Auto-updates' : 'Start Auto-updates'}
          </button>
          <button disabled={updating} onPress={() => forceUpdate?.()} appearance={'destructive'}>
            Force Update
          </button>
        </hstack>
        <spacer size={'large'} />
      </>
    ) : (
      <></>
    );

  return (
    <vstack alignment={'center'} padding={'small'} grow>
      <hstack width={'100%'} alignment={'end'}>
        <icon
          name={isMod ? (showModActions ? 'mod-fill' : 'mod-outline') : 'admin'}
          color={isMod ? 'black white' : 'orangered'}
          onPress={toggleModActions}
        />
      </hstack>
      {modActions}

      <spacer grow />

      <text>Last action: {action}</text>
      <text>Updated at: {date ? dateString(date) + ' PST' : 'UNKNOWN'}</text>

      <spacer size={'large'} />

      <text>Scheduled updates enabled: {autoUpdateEnabled ? '🟢' : '🟥'}</text>
      <text>
        Last scheduled update:{' '}
        {lastScheduledUpdateTime ? dateString(lastScheduledUpdateTime) + ' PST' : '(PENDING)'}
      </text>

      <spacer grow />
    </vstack>
  );
};
