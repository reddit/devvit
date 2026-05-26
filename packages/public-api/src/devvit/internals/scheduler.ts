import type { ScheduledAction } from '@devvit/protos/json/devvit/actor/scheduler/action.js';
import type { Empty } from '@devvit/protos/json/google/protobuf/empty.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { SchedulerHandler } from '@devvit/protos/types/devvit/actor/scheduler/handler.js';
// eslint-disable-next-line no-restricted-imports
import { SchedulerHandlerDefinition } from '@devvit/protos/types/devvit/actor/scheduler/handler.js';
import type { Config } from '@devvit/shared-types/Config.js';

import { makeAPIClients } from '../../apis/makeAPIClients.js';
import { Devvit } from '../Devvit.js';
import { getContextFromMetadata } from './context.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';

async function handleScheduledAction(args: ScheduledAction, metadata: Metadata): Promise<Empty> {
  const jobName = args.type;
  const scheduledJobHandler = Devvit.scheduledJobHandlers?.get(jobName);

  if (!scheduledJobHandler) {
    throw new Error(`Job ${jobName} not found`);
  }

  const event = {
    name: jobName,
    data: args.data,
  };

  const context = Object.assign(
    makeAPIClients({
      metadata,
    }),
    getContextFromMetadata(metadata)
  );

  await scheduledJobHandler(event, context);

  return {};
}

export function registerScheduler(config: Config): void {
  config.provides(SchedulerHandlerDefinition);
  extendDevvitPrototype<SchedulerHandler>('HandleScheduledAction', handleScheduledAction);
}
