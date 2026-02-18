import {
  AppSettingsDefinition,
  ContextActionDefinition,
  CustomPostDefinition,
  Definition,
  FlairDefinition,
  GraphQLDefinition,
  HTTPDefinition,
  InstallationSettingsDefinition,
  LinksAndCommentsDefinition,
  ListingsDefinition,
  MediaServiceDefinition,
  ModerationDefinition,
  ModNoteDefinition,
  NewModmailDefinition,
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
  type Permissions,
  PrivateMessagesDefinition,
  RealtimeDefinition,
  RedisAPIDefinition,
  SchedulerHandlerDefinition,
  SettingsDefinition,
  SubredditsDefinition,
  UIEventHandlerDefinition,
  UserActionsDefinition,
  UsersDefinition,
  WidgetsDefinition,
  WikiDefinition,
} from '@devvit/protos';
import type { ActorSpec, DependencySpec } from '@devvit/protos/community.js';
import { PaymentProcessorDefinition, PaymentsServiceDefinition } from '@devvit/protos/payments.js';
import { WebbitServerDefinition } from '@devvit/protos/types/devvit/actor/webbit/webbit.js';
import { BlobServiceDefinition } from '@devvit/protos/types/devvit/plugin/blob/v1alpha/blob.js';
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
