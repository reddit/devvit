import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import Settings from '../settings.json';

interface TabsProps {
  children: JSX.Element[];
}

export const Tabs = (props: TabsProps): JSX.Element => (
  <hstack alignment="middle">{props.children}</hstack>
);

interface TabProps {
  label: string;
  onPress: () => void;
  isActive: boolean;
}

export const Tab = (props: TabProps): JSX.Element => {
  const { label, onPress, isActive } = props;
  return (
    <hstack onPress={onPress}>
      <spacer width="12px" />
      <vstack alignment="center">
        <spacer height="24px" />
        <PixelText color={isActive ? Settings.theme.primary : Settings.theme.secondary}>
          {label}
        </PixelText>
        <spacer height="6px" />
        <hstack
          height="2px"
          width="100%"
          backgroundColor={isActive ? Settings.theme.primary : 'transparent'}
        />
      </vstack>
      <spacer width="12px" />
    </hstack>
  );
};

/*
Usage example:

<Tabs>
  {tabs.map((label) => (
    <Tab
      label={label}
      isActive={tab === label}
      onPress={() => {
        setPage(label);
      }}
    />
  ))}
</Tabs>
*/
