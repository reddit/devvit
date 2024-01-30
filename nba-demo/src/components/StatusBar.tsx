import { Devvit } from '@devvit/public-api';

type StatusBarProps = {
  timeLeftFormatted: string; // 1:03
  additionalTimeFormatted: string; // no idea what that is, prototype had ":23" there
  gamePhase: string; // Q1, Q2
  isLive: boolean;
};

export function StatusBar(props: StatusBarProps): JSX.Element {
  return (
    <hstack width={100} height="40px" backgroundColor="#0e1416">
      <spacer size="medium" />
      <hstack width="80px" alignment="start"></hstack>
      <spacer grow />
      <hstack alignment="center middle">
        <text color="#f3f4f5">{props.gamePhase}</text>
        <spacer size="small" />
        <hstack
          backgroundColor="#962900"
          cornerRadius="medium"
          width="60px"
          height="26px"
          alignment="center middle"
        >
          <text color="#ffffff">{props.timeLeftFormatted}</text>
        </hstack>
        <spacer size="small" />
        <text color="#b8c5c9">{props.additionalTimeFormatted}</text>
      </hstack>
      <spacer grow />
      <hstack width="80px" alignment="end middle">
        <LiveIndicator isLive={props.isLive} />
      </hstack>
      <spacer size="medium" />
    </hstack>
  );
}

function LiveIndicator(props: { isLive: boolean }): JSX.Element {
  return props.isLive ? (
    <hstack alignment="center middle">
      <text color="#ff0000">LIVE</text>
      <spacer size="xsmall" />
      <hstack backgroundColor="#ff0000" width="8px" height="8px" cornerRadius="full" />
    </hstack>
  ) : null;
}
