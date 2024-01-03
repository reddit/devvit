import { Devvit, IconName } from '@devvit/public-api';

export type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
};

export const IconButton = (props: IconButtonProps) => {
  const { icon, onPress } = props;
  return (
    <hstack
      backgroundColor="rgba(255, 255, 255, 0.1)"
      cornerRadius="full"
      height="40px"
      width="40px"
      alignment="center middle"
      onPress={onPress}
    >
      <icon name={icon} color="white" />
    </hstack>
  );
};
