import { Devvit } from '@devvit/public-api';

import BlockComponent = Devvit.BlockComponent;

type RadioButtonProps = {
  label: string;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
  textColor?: string;
  disabledTextColor?: string;
  radioBorderColor?: string;
  disabledRadioBorderColor?: string;
  radioFillColor?: string;
  disabledRadioFillColor?: string;
  disabled?: boolean | undefined;
  grow?: boolean | undefined;
};

export const RadioButton: BlockComponent<RadioButtonProps> = ({
  label,
  value,
  checked,
  onPress,
  textColor,
  disabledTextColor,
  disabled,
  grow,
}) => {
  return (
    <hstack
      gap={'small'}
      alignment={'middle'}
      onPress={!disabled ? () => onPress(value) : undefined}
      grow={grow || false}
    >
      <icon name={checked ? 'radio-button-fill' : 'radio-button-outline'} color={'black'} />
      <text selectable={false} color={!disabled ? textColor : disabledTextColor}>
        {label}
      </text>
    </hstack>
  );
};
