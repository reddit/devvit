import { Devvit } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';

export type ConnectionStatusProps = { status: ChannelStatus };

const labelByStatus: { [status in ChannelStatus]: string } = {
  [ChannelStatus.Connected]: '🟢 connected',
  [ChannelStatus.Connecting]: '🟡 connecting',
  [ChannelStatus.Disconnected]: '🔴 disconnected',
  [ChannelStatus.Disconnecting]: '🟠 disconnecting',
  [ChannelStatus.Unknown]: '⚪ unknown',
};

export function ConnectionStatus(props: Readonly<ConnectionStatusProps>): JSX.Element {
  return (
    <vstack alignment="end">
      <hstack height="50px" alignment="center">
        <spacer size="medium" />
        <text size="medium" weight="bold">
          {labelByStatus[props.status]}
        </text>
      </hstack>
    </vstack>
  );
}
