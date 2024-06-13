import { Devvit } from '@devvit/public-api';

export type DpadProps = {
  disabled: boolean;
  onPress(x: number, y: number): Promise<void>;
};

export function Dpad(props: DpadProps): JSX.Element {
  return (
    <hstack padding="large" gap="large">
      <vstack
        alignment="center"
        backgroundColor="rgba(0,0,0,0.5)"
        cornerRadius="full"
        padding="small"
      >
        <button disabled={props.disabled} onPress={() => props.onPress(0, -1)} size="small">
          ↑
        </button>
        <hstack gap="large">
          <button disabled={props.disabled} onPress={() => props.onPress(-1, 0)} size="small">
            ←
          </button>
          <button disabled={props.disabled} onPress={() => props.onPress(1, 0)} size="small">
            →
          </button>
        </hstack>
        <button disabled={props.disabled} onPress={() => props.onPress(0, 1)} size="small">
          ↓
        </button>
      </vstack>
    </hstack>
  );
}
