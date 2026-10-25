// to-do: build examples with the CLI instead of maintaining these bundling scripts.

import type { ActorSpec, DependencySpec } from '@devvit/protos/json/devvit/runtime/bundle.js';
import { Definition } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import { HelloDefinition } from '@devvit/protos/types/devvit/actor/hello/hello.js';
// eslint-disable-next-line no-restricted-imports
import { WrapperTypesDefinition } from '@devvit/protos/types/devvit/actor/test/wrappertypes.js';
// eslint-disable-next-line no-restricted-imports
import { RealtimeDefinition } from '@devvit/protos/types/devvit/events/v1alpha/realtime.js';
// eslint-disable-next-line no-restricted-imports
import { HTTPDefinition } from '@devvit/protos/types/devvit/plugin/http/http.js';
// eslint-disable-next-line no-restricted-imports
import { KVStoreDefinition } from '@devvit/protos/types/devvit/plugin/kvstore/kvstore.js';
// eslint-disable-next-line no-restricted-imports
import { LoggerDefinition } from '@devvit/protos/types/devvit/plugin/logger/logger.js';
// eslint-disable-next-line no-restricted-imports
import { MediaServiceDefinition } from '@devvit/protos/types/devvit/plugin/media/media.js';
// eslint-disable-next-line no-restricted-imports
import { FlairDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/flair/flair_svc.js';
// eslint-disable-next-line no-restricted-imports
import { GraphQLDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/graphql/graphql_svc.js';
// eslint-disable-next-line no-restricted-imports
import { LinksAndCommentsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_svc.js';
// eslint-disable-next-line no-restricted-imports
import { ListingsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/listings/listings_svc.js';
// eslint-disable-next-line no-restricted-imports
import { ModerationDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/moderation/moderation_svc.js';
// eslint-disable-next-line no-restricted-imports
import { ModNoteDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/modnote/modnote_svc.js';
// eslint-disable-next-line no-restricted-imports
import { NewModmailDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/newmodmail/newmodmail_svc.js';
// eslint-disable-next-line no-restricted-imports
import { PrivateMessagesDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/privatemessages/privatemessages_svc.js';
// eslint-disable-next-line no-restricted-imports
import { SubredditsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/subreddits/subreddits_svc.js';
// eslint-disable-next-line no-restricted-imports
import { UsersDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/users/users_svc.js';
// eslint-disable-next-line no-restricted-imports
import { WidgetsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/widgets/widgets_svc.js';
// eslint-disable-next-line no-restricted-imports
import { WikiDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/wiki/wiki_svc.js';
// eslint-disable-next-line no-restricted-imports
import { RedisAPIDefinition } from '@devvit/protos/types/devvit/plugin/redis/redisapi.js';
// eslint-disable-next-line no-restricted-imports
import { SchedulerDefinition } from '@devvit/protos/types/devvit/plugin/scheduler/scheduler.js';
// eslint-disable-next-line no-restricted-imports
import { TimerDefinition } from '@devvit/protos/types/devvit/plugin/timer/timer.js';

import { LOCAL_HOSTNAME, PLUGIN_NAME, resolveActorHostname } from './HostnameUtil.js';

// Raw actor fixtures can call any of the plugins used by the examples.
const USES: readonly Readonly<Definition>[] = [
  WrapperTypesDefinition,
  RealtimeDefinition,
  HTTPDefinition,
  KVStoreDefinition,
  LoggerDefinition,
  MediaServiceDefinition,
  FlairDefinition,
  GraphQLDefinition,
  LinksAndCommentsDefinition,
  ListingsDefinition,
  ModerationDefinition,
  ModNoteDefinition,
  NewModmailDefinition,
  PrivateMessagesDefinition,
  SubredditsDefinition,
  UsersDefinition,
  WidgetsDefinition,
  WikiDefinition,
  RedisAPIDefinition,
  SchedulerDefinition,
  TimerDefinition,
];

/** Supplies local actor examples with shared plugins and their provided services. */
export function ExampleActorDependencySpec(
  actor: Readonly<ActorSpec>,
  provides: readonly Readonly<Definition>[] = [HelloDefinition]
): DependencySpec {
  return {
    actor: structuredClone(actor),
    hostname: resolveActorHostname(actor.name, { hostname: LOCAL_HOSTNAME }),
    provides: provides.map((definition) => ({
      actor: structuredClone(actor),
      definition: Definition.toSerializable(definition),
      partitionsBy: [],
    })),
    uses: USES.map((definition) => ({ name: PLUGIN_NAME, typeName: definition.fullName })),
    permissions: [],
  };
}
