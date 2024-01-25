import { Devvit } from '@devvit/public-api';

export type ClaimButtonProps = {
  onPress: () => void | Promise<void>;
  disabled: boolean;
};

export const ClaimButton = (props: ClaimButtonProps) => {
  const { onPress, disabled } = props;
  const colorDisabled = '#ffffffb3';
  return (
    <hstack
      backgroundColor={disabled ? colorDisabled : 'white'}
      cornerRadius="full"
      onPress={disabled ? undefined : onPress}
      height="40px"
      alignment="middle center"
      grow
    >
      <spacer size="medium" />
      <text weight="bold" size="medium" color="#372F8C" selectable={false}>
        Capture Flag
      </text>
      <spacer size="medium" />
    </hstack>
  );
};
