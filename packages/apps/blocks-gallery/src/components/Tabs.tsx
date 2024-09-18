import { Devvit } from '@devvit/public-api';

type TabsProps = { tabs: TabProps[]; backIcon: JSX.Element; forwardIcon: JSX.Element };
type TabProps = { label: string; isActive: boolean; onPress: () => void };

const Tab = ({ label, isActive, onPress }: TabProps): JSX.Element => {
  return (
    <button appearance={isActive ? 'primary' : 'secondary'} size="small" onPress={onPress}>
      {label}
    </button>
  );
};

export const Tabs = ({ tabs, backIcon, forwardIcon }: TabsProps): JSX.Element => {
  return (
    <hstack alignment="start" gap="small">
      {backIcon}
      {tabs.map(({ label, isActive, onPress }) => (
        <Tab label={label} isActive={isActive} onPress={onPress} />
      ))}
      {forwardIcon}
    </hstack>
  );
};
