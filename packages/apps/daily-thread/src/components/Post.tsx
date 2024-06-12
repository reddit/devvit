import { Devvit } from '@devvit/public-api';

export async function PostComponent(plugins: JSX.Element[]): Promise<JSX.Element> {
  return (
    <vstack height="100%" width="100%" alignment="center top">
      {plugins.map((plugin, index) => {
        return (
          <vstack width="100%" grow>
            {plugin}
            {index < plugins.length - 1 ? (
              <hstack height="2px" width="100%" backgroundColor="neutral-background" />
            ) : null}
          </vstack>
        );
      })}
    </vstack>
  );
}
