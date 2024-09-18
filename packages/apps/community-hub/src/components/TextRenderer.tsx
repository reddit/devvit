import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';

import type { richTextBody } from '../api/Schema.js';

export const TextRenderer = ({ body }: { body: z.infer<typeof richTextBody> }): JSX.Element => {
  return (
    <vstack>
      {body.map((node) => {
        // eslint-disable-next-line sonarjs/no-small-switch
        switch (node.type) {
          case 'paragraph':
            return (
              <hstack>
                {node.children.map((x) => (
                  // Setting these defaults to be consistent with the original UI. Don't want to
                  // persist them in case we want to be able to change easily
                  <text color="black white" weight={x.weight ?? 'bold'} size={x.size ?? 'small'}>
                    {x.text}
                  </text>
                ))}
              </hstack>
            );
          default:
            throw new Error(`Unhandled route: ${node.type satisfies never}`);
        }
      })}
    </vstack>
  );
};
