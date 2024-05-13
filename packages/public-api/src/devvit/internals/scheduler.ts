import type { Metadata, ScheduledAction } from '@devvit/protos';
import { SchedulerHandlerDefinition } from '@devvit/protos';
import type { Config } from '@devvit/shared-types/Config.js';
import { makeAPIClients } from '../../apis/makeAPIClients.js';
import { Devvit } from '../Devvit.js';
import { getContextFromMetadata } from './context.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';

async function handleScheduledAction(args: ScheduledAction, metadata: Metadata): Promise<void> {
  const jobName = args.type;
  const scheduledJobHandler = Devvit.scheduledJobHandlers.get(jobName);

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
}

export function registerScheduler(config: Config): void {
  config.provides(SchedulerHandlerDefinition);
  extendDevvitPrototype('HandleScheduledAction', handleScheduledAction);
}
