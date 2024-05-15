import type { IconName } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

export type BasicTextData = {
  title: string;
  description: string;
};

export type BasicTextComponentProps = {
  data: BasicTextData;
  iconName: IconName;
  iconBgColor: string;
};

export const BasicTextComponent: Devvit.BlockComponent<BasicTextComponentProps> = ({
  data,
  iconName,
  iconBgColor,
}) => {
  return (
    <hstack width={'100%'} grow alignment="start middle">
      <vstack height={'100%'} width={'40px'} backgroundColor={iconBgColor} alignment="center top">
        <spacer size="small" />
        <icon name={iconName} color="black" />
      </vstack>
      <vstack
        height={'100%'}
        backgroundColor="neutral-background-weak"
        padding="small"
        alignment="start top"
        grow
      >
        <text style="metadata" size="small">
          {data.title}
        </text>
        <spacer size="xsmall" />
        <text weight="bold" wrap>
          {data.description}
        </text>
      </vstack>
    </hstack>
  );
};
