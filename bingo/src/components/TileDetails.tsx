import { Devvit } from '@devvit/public-api';

type TileProps = {
  text: string;
  active: boolean;
  onClose: () => void | Promise<void>;
  onToggle: () => void | Promise<void>;
};

export const TileDetails = (props: TileProps): JSX.Element => {
  const { text, active, onToggle, onClose } = props;
  return (
    <vstack height={100} width={100} backgroundColor="#FFF">
      <hstack
        width={100}
        alignment="middle start"
        backgroundColor="#F9FAFA"
        height="40px"
        padding="xsmall"
      >
        <spacer size="xsmall" />
        <text size="medium" color="#0F1A1C" weight="bold">
          Tile Details
        </text>
        <spacer grow />
        <hstack
          width="32px"
          height="32px"
          backgroundColor="#1A282D"
          onPress={onClose}
          alignment="center middle"
          cornerRadius="full"
        >
          <icon name="close-outline" color="#FFFFFF" size="small" />
        </hstack>
        <spacer size="xsmall" />
      </hstack>
      <hstack width={100} height="1px" backgroundColor="#00000033" />
      <hstack
        width={100}
        grow
        padding="large"
        alignment="middle center"
        backgroundColor={active ? '#DFF8DB' : '#FFFFFF'}
      >
        <text
          maxWidth={100}
          maxHeight={100}
          wrap={true}
          size="xxlarge"
          weight="bold"
          color="#0F1A1C"
          alignment="middle center"
        >
          {text}
        </text>
      </hstack>
      <hstack
        height="56px"
        alignment={'center middle'}
        backgroundColor={active ? '#DFF8DB' : '#FFFFFF'}
      >
        <button
          size="medium"
          icon={active ? undefined : 'checkmark-fill'}
          appearance={active ? 'media' : 'primary'}
          onPress={onToggle}
        >
          {active ? 'Mark as incomplete' : 'Mark as complete'}
        </button>
      </hstack>
    </vstack>
  );
};
