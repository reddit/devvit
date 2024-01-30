import { Devvit } from '@devvit/public-api';

type PlayGalleryProps = {
  currentPlay: { title: string; text: string };
  onPreviousPlayNavigation?: () => void;
  onNextPlayNavigation?: () => void;
};

export function PlayGallery(props: PlayGalleryProps): JSX.Element {
  return (
    <hstack width={100} height="80px" backgroundColor="black" cornerRadius="small" padding="small">
      <hstack onPress={props.onPreviousPlayNavigation} alignment="center middle">
        <icon
          name="caret-left-fill"
          size="medium"
          color={props.onPreviousPlayNavigation ? '#ffffff' : '#424343'}
        />
      </hstack>
      <spacer size="medium" />
      <vstack grow>
        <text size="medium" weight="bold" color="#b8c5c9">
          {props.currentPlay.title}
        </text>
        <spacer size="xsmall" />
        <text size="medium" wrap={true} color="#b8c5c9">
          {props.currentPlay.text}
        </text>
      </vstack>
      <spacer size="medium" />
      <hstack onPress={props.onNextPlayNavigation} alignment="center middle">
        <icon
          name="caret-right-fill"
          size="medium"
          color={props.onNextPlayNavigation ? '#ffffff' : '#424343'}
        />
      </hstack>
    </hstack>
  );
}
