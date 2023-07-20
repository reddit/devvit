import { Devvit } from '@devvit/public-api';

type TabsProps = { tabs: TabProps[] };
type TabProps = { label: string; isActive: boolean; onPress: () => void };

const Tab = ({ label, isActive, onPress }: TabProps): JSX.Element => {
  return (
    <button appearance={isActive ? 'primary' : 'secondary'} size="small" onPress={onPress}>
      {label}
    </button>
  );
};

export const Tabs = ({ tabs }: TabsProps): JSX.Element => {
  return (
    <hstack alignment="start" gap="small">
      {tabs.map(({ label, isActive, onPress }) => (
        <Tab label={label} isActive={isActive} onPress={onPress} />
      ))}
    </hstack>
  );
};
