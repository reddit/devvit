import { Devvit } from '@devvit/public-api';
import { AutoUpdate } from './AutoUpdate.js';

type AutoUpdateCacheProps = {
  autoUpdateEnabled: boolean;
  initialPostTime?: Date | undefined;
  schedulerUpdateTime?: Date | undefined;
  liveRenderTime?: Date | undefined;
};

export const AutoUpdateCache = ({
  autoUpdateEnabled,
  initialPostTime,
  schedulerUpdateTime,
  liveRenderTime,
}: AutoUpdateCacheProps) => {
  return (
    <AutoUpdate
      isMod={false}
      autoUpdateEnabled={autoUpdateEnabled}
      initialPostTime={initialPostTime}
      schedulerUpdateTime={schedulerUpdateTime}
      liveRenderTime={liveRenderTime}
      lastScheduledUpdateTime={schedulerUpdateTime}
    />
  );
};
