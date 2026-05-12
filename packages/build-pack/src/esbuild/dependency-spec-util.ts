import {
  type ActorSpec,
  type DependencySpec,
  type Permissions,
} from '@devvit/protos/json/devvit/runtime/bundle.js';
import { Definition } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import {
  OnAppInstallDefinition,
  OnAppUpgradeDefinition,
  OnAutomoderatorFilterCommentDefinition,
  OnAutomoderatorFilterPostDefinition,
  OnCommentCreateDefinition,
  OnCommentDeleteDefinition,
  OnCommentReportDefinition,
  OnCommentSubmitDefinition,
  OnCommentUpdateDefinition,
  OnModActionDefinition,
  OnModMailDefinition,
  OnPostCreateDefinition,
  OnPostDeleteDefinition,
  OnPostFlairUpdateDefinition,
  OnPostNsfwUpdateDefinition,
  OnPostReportDefinition,
  OnPostSpoilerUpdateDefinition,
  OnPostSubmitDefinition,
  OnPostUpdateDefinition,
} from '@devvit/protos/types/devvit/actor/automation/v1alpha/event_handlers.js';
// eslint-disable-next-line no-restricted-imports
import { PaymentProcessorDefinition } from '@devvit/protos/types/devvit/actor/payments/v1alpha/payments.js';
// eslint-disable-next-line no-restricted-imports
import { ContextActionDefinition } from '@devvit/protos/types/devvit/actor/reddit/context_action.js';
// eslint-disable-next-line no-restricted-imports
import { SchedulerHandlerDefinition } from '@devvit/protos/types/devvit/actor/scheduler/handler.js';
// eslint-disable-next-line no-restricted-imports
import { AppSettingsDefinition } from '@devvit/protos/types/devvit/actor/settings/v1alpha/app_settings.js';
// eslint-disable-next-line no-restricted-imports
import { InstallationSettingsDefinition } from '@devvit/protos/types/devvit/actor/settings/v1alpha/installation_settings.js';
// eslint-disable-next-line no-restricted-imports
import { WebbitServerDefinition } from '@devvit/protos/types/devvit/actor/webbit/webbit.js';
// eslint-disable-next-line no-restricted-imports
import { RealtimeDefinition } from '@devvit/protos/types/devvit/events/v1alpha/realtime.js';
// eslint-disable-next-line no-restricted-imports
import { BlobServiceDefinition } from '@devvit/protos/types/devvit/plugin/blob/v1alpha/blob.js';
// eslint-disable-next-line no-restricted-imports
import { ExternalEndpointsDefinition } from '@devvit/protos/types/devvit/plugin/externalendpoints/v1alpha/externalendpoints.js';
// eslint-disable-next-line no-restricted-imports
import { HTTPDefinition } from '@devvit/protos/types/devvit/plugin/http/http.js';
// eslint-disable-next-line no-restricted-imports
import { MediaServiceDefinition } from '@devvit/protos/types/devvit/plugin/media/media.js';
// eslint-disable-next-line no-restricted-imports
import { PaymentsServiceDefinition } from '@devvit/protos/types/devvit/plugin/payments/v1alpha/payments.js';
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
import { SettingsDefinition } from '@devvit/protos/types/devvit/plugin/settings/v1alpha/settings.js';
// eslint-disable-next-line no-restricted-imports
import { UserActionsDefinition } from '@devvit/protos/types/devvit/plugin/useractions/useractions.js';
// eslint-disable-next-line no-restricted-imports
import { CustomPostDefinition } from '@devvit/protos/types/devvit/reddit/custom_post/v1alpha/custom_post.js';
// eslint-disable-next-line no-restricted-imports
import { UIEventHandlerDefinition } from '@devvit/protos/types/devvit/ui/events/v1alpha/handle_ui.js';
import { normalizeDomains } from '@devvit/shared-types/fetch-domains.js';
import { PLUGIN_NAME, resolveActorHostname } from '@devvit/shared-types/HostnameUtil.js';
import type { Namespace } from '@devvit/shared-types/Namespace.js';
import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';

/**
 * Convert a static `AppConfig` to a `DependencySpec`. Similar to the classic
 * `Devvit` singleton, `ConfigImpl`, `addPaymentHandler()`, and
 * `paymentsPlugin`.
 *
 * Consider the config objects to determine uses / provides since the config
 * objects have more granularity (eg, triggers). If a config and a permission
 * exists, only the config needs to be consulted.
 *
 * The `provide()` / `use()` helpers deduplicate.
 */
export function createDependencySpec(
  actorSpec: Readonly<ActorSpec>,
  config: Readonly<Omit<AppConfig, 'json'>>,
  namespace: Readonly<Namespace>
): DependencySpec {
  const spec: DependencySpec = {
    actor: actorSpec,
    hostname: resolveActorHostname(actorSpec.name, namespace),
    permissions: [],
    provides: [],
    uses: [],
  };

  const permissions: Permissions = {
    requestedFetchDomains: [],
    asUserScopes: [],
  };

  if (config.permissions.http.enable) {
    use(spec, HTTPDefinition);
    permissions.requestedFetchDomains.push(...normalizeDomains(config.permissions.http.domains));
  }
  if (config.permissions.media) use(spec, MediaServiceDefinition);
  if (config.permissions.payments) {
    use(spec, PaymentsServiceDefinition);
    provide(spec, PaymentProcessorDefinition);
  }
  if (config.permissions.realtime) use(spec, RealtimeDefinition);
  if (config.permissions.reddit.enable) {
    use(
      spec,
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
      WikiDefinition
    );
    if (config.permissions.reddit.asUser.length > 0) {
      use(spec, UserActionsDefinition);
      permissions.asUserScopes.push(...config.permissions.reddit.asUser);
    }
  }

  if (config.permissions.blob) use(spec, BlobServiceDefinition);

  if (config.permissions.redis) use(spec, RedisAPIDefinition);

  if (permissions.requestedFetchDomains.length > 0 || permissions.asUserScopes.length > 0) {
    spec.permissions.push(permissions);
  }

  if (config.post) provide(spec, CustomPostDefinition, UIEventHandlerDefinition);

  if (config.server) provide(spec, WebbitServerDefinition);
  if (config.server?.externalEndpoints) use(spec, ExternalEndpointsDefinition);

  if (config.menu) provide(spec, ContextActionDefinition);

  if (config.payments) {
    provide(spec, PaymentProcessorDefinition);
    use(spec, PaymentsServiceDefinition);
  }

  if (config.forms) provide(spec, UIEventHandlerDefinition);

  if (config.scheduler) {
    provide(spec, SchedulerHandlerDefinition);
    if (Object.values(config.scheduler.tasks).some((task) => task.cron)) {
      // `blocks.template.tsx` resets tasks on install and upgrade triggers.
      provide(spec, OnAppInstallDefinition);
      provide(spec, OnAppUpgradeDefinition);
    }
  }

  if (config.triggers) {
    if (config.triggers.onAppInstall != null) provide(spec, OnAppInstallDefinition);
    if (config.triggers.onAppUpgrade != null) provide(spec, OnAppUpgradeDefinition);
    if (config.triggers.onAutomoderatorFilterComment != null)
      provide(spec, OnAutomoderatorFilterCommentDefinition);
    if (config.triggers.onAutomoderatorFilterPost != null)
      provide(spec, OnAutomoderatorFilterPostDefinition);
    if (config.triggers.onCommentCreate != null) provide(spec, OnCommentCreateDefinition);
    if (config.triggers.onCommentDelete != null) provide(spec, OnCommentDeleteDefinition);
    if (config.triggers.onCommentReport != null) provide(spec, OnCommentReportDefinition);
    if (config.triggers.onCommentSubmit != null) provide(spec, OnCommentSubmitDefinition);
    if (config.triggers.onCommentUpdate != null) provide(spec, OnCommentUpdateDefinition);
    if (config.triggers.onModAction != null) provide(spec, OnModActionDefinition);
    if (config.triggers.onModMail != null) provide(spec, OnModMailDefinition);
    if (config.triggers.onPostCreate != null) provide(spec, OnPostCreateDefinition);
    if (config.triggers.onPostDelete != null) provide(spec, OnPostDeleteDefinition);
    if (config.triggers.onPostFlairUpdate != null) provide(spec, OnPostFlairUpdateDefinition);
    if (config.triggers.onPostNsfwUpdate != null) provide(spec, OnPostNsfwUpdateDefinition);
    if (config.triggers.onPostReport != null) provide(spec, OnPostReportDefinition);
    if (config.triggers.onPostSpoilerUpdate != null) provide(spec, OnPostSpoilerUpdateDefinition);
    if (config.triggers.onPostSubmit != null) provide(spec, OnPostSubmitDefinition);
    if (config.triggers.onPostUpdate != null) provide(spec, OnPostUpdateDefinition);
  }

  if (config.settings) {
    use(spec, SettingsDefinition);
    if (config.settings.global) {
      provide(spec, AppSettingsDefinition);
    }
    if (config.settings.subreddit) {
      provide(spec, InstallationSettingsDefinition);
    }
  }

  return spec;
}

function provide(spec: DependencySpec, ...definitions: readonly Readonly<Definition>[]): void {
  spec.provides.push(
    ...definitions
      .filter(
        (def) => !spec.provides.some((provide) => provide.definition?.fullName === def.fullName)
      )
      .map((def) => ({
        actor: structuredClone(spec.actor),
        definition: Definition.toSerializable(def),
        partitionsBy: [],
      }))
  );
}

function use(spec: DependencySpec, ...definitions: readonly Readonly<Definition>[]): void {
  spec.uses.push(
    ...definitions
      .filter((def) => !spec.uses.some((use) => use.typeName === def.fullName))
      .map((def) => ({ name: PLUGIN_NAME, typeName: def.fullName }))
  );
}
