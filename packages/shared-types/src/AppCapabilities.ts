import {
  ContextActionDefinition,
  CustomPostDefinition,
  FlairDefinition,
  GraphQLDefinition,
  HTTPDefinition,
  InstallationSettingsDefinition,
  KVStoreDefinition,
  LinksAndCommentsDefinition,
  ListingsDefinition,
  MediaServiceDefinition,
  ModerationDefinition,
  ModlogDefinition,
  ModNoteDefinition,
  NewModmailDefinition,
  OnAppInstallDefinition,
  OnAppUpgradeDefinition,
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
  OnPostReportDefinition,
  OnPostSubmitDefinition,
  OnPostUpdateDefinition,
  PrivateMessagesDefinition,
  RedisAPIDefinition,
  SchedulerDefinition,
  SchedulerHandlerDefinition,
  SettingsDefinition,
  SubredditsDefinition,
  UIEventHandlerDefinition,
  UserActionsDefinition,
  UsersDefinition,
  WidgetsDefinition,
  WikiDefinition,
} from '@devvit/protos';
import { NutritionCategory } from '@devvit/protos/community.js';
import type { LinkedBundle } from '@devvit/protos/index.js';
import { PaymentProcessorDefinition, PaymentsServiceDefinition } from '@devvit/protos/payments.js';
import {
  OnAccountDeleteDefinition,
  OnSubredditSubscribeDefinition,
} from '@devvit/protos/types/devvit/actor/automation/v1alpha/event_handlers.js';
import { AssetResolverDefinition } from '@devvit/protos/types/devvit/plugin/assetresolver/assetresolver.js';
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';

/** Actor Plugins API as recorded in Prisma. */
type AppActorTypes = readonly { readonly name: string }[];
/** Actor Types API as recorded in Prisma. */
type AppActorPlugins = readonly { readonly fullname: string }[];
/** Subset of the Actor object recorded in Prisma.  */
type AppCapabilitiesActor = Readonly<{
  types: AppActorTypes;
  plugins: AppActorPlugins;
}>;

/**
 * Finds all of the capabilities that an app has based on its version.
 */
export function appCapabilitiesFromAppVersion(
  version: Readonly<{ actors: AppCapabilitiesActor[]; assets?: { webviewAsset: boolean }[] }>
): NutritionCategory[] {
  const hasAssets = Array.isArray(version.assets) && version.assets.length > 0;
  const hasWebView = version.assets?.some((asset) => asset.webviewAsset) ?? false;
  const capabilities = version.actors.flatMap((actor) =>
    appCapabilitiesFromActor({
      actorTypes: actor.types,
      actorPlugins: actor.plugins,
      hasAssets,
      hasWebView,
    })
  );
  // Filter out dups.
  return [...new Set(capabilities)];
}
/**
 * Finds all of the capabilities that an app has based on its actor.
 */
export function appCapabilitiesFromActor({
  actorTypes,
  actorPlugins,
  hasAssets,
  hasWebView,
}: {
  actorTypes: Readonly<AppActorTypes>;
  actorPlugins: Readonly<AppActorPlugins>;
  hasAssets: boolean;
  hasWebView: boolean;
}): NutritionCategory[] {
  const names = [
    ...actorTypes.map((provide) => provide.name),
    ...actorPlugins.map((use) => use.fullname),
  ];
  return appCapabilitiesFromFullNames(names, hasAssets, hasWebView);
}

/**
 * Finds all of the capabilities that an app has based on its linked bundle.
 */
export function appCapabilitiesFromLinkedBundle(
  bundle: Readonly<LinkedBundle>
): NutritionCategory[] {
  const getFlatListOfServiceDefinitions = (bundle: LinkedBundle): LinkedBundle['provides'] => [
    ...(bundle.provides ?? []),
    // Recursively get the provides from child uses.
    ...(bundle.uses?.length ? bundle.uses.flatMap(getFlatListOfServiceDefinitions) : []),
  ];

  const names = getFlatListOfServiceDefinitions(bundle)
    // If undefined, there is still an unknown provide that should not be
    // filtered out.
    .map((definition) => definition.fullName ?? '');

  const hasAssets = Object.keys(bundle.assets).length > 0;
  const hasWebview = Object.keys(bundle.webviewAssets).length > 0;
  return appCapabilitiesFromFullNames(names, hasAssets, hasWebview);
}

/**
 * Finds all of the capabilities that an app has based on its bundle.
 */
export function appCapabilitiesFromBundle(bundle: Readonly<Bundle>): NutritionCategory[] {
  const names = [
    ...(bundle.dependencies?.provides ?? []).map((provide) => provide.definition?.fullName ?? ''),
    ...(bundle.dependencies?.uses ?? []).map((use) => use.typeName),
  ];
  const hasAssets = Object.keys(bundle.assetIds).length > 0;
  const hasWebview = Object.keys(bundle.webviewAssetIds).length > 0;

  return appCapabilitiesFromFullNames(names, hasAssets, hasWebview);
}

function appCapabilitiesFromFullNames(
  fullNames: readonly string[],
  hasAssets: boolean,
  hasWebview: boolean
): NutritionCategory[] {
  const appCapabilities = fullNames
    .flatMap((name) => appCapabilityFromFullName(name, hasAssets))
    .filter((capability): capability is NutritionCategory => capability != null);
  // All apps have moderator permissions implicitly.
  appCapabilities.push(NutritionCategory.MODERATOR);
  if (hasWebview) {
    appCapabilities.push(NutritionCategory.WEBVIEW);
  }
  // Filter out dups.
  return [...new Set(appCapabilities)];
}

/**
 * Definition.fullName to AppCapability. We don't really care about the
 * server / client-ness--we consider the worst-case scenario. For example, the
 * worst-case for any Reddit API is an app _using_ the API but the worst-case
 * for any trigger is _providing_ it. Another example is the scheduler, if an
 * app provides a scheduler job callback OR uses the scheduler plugin, we assume
 * the scheduler capability.
 *
 * Returns an array because some definitions can map to multiple capability categories.
 */
function appCapabilityFromFullName(
  fullName: string,
  hasAssets: boolean
): (NutritionCategory | undefined)[] {
  switch (fullName) {
    case AssetResolverDefinition.fullName:
      // Every app depends on the asset resolver. The resolver is used for
      // conventional URLs like https://example.com/foo.gif, data URLs, and
      // relative URLs to static assets. We can only report on static assets and
      // that requires more detail.
      return [hasAssets ? NutritionCategory.ASSETS : undefined];

    case CustomPostDefinition.fullName:
      return [NutritionCategory.CUSTOM_POST, NutritionCategory.UI];

    case ContextActionDefinition.fullName:
    case UIEventHandlerDefinition.fullName:
      return [NutritionCategory.UI];

    case InstallationSettingsDefinition.fullName:
    case SettingsDefinition.fullName:
    case KVStoreDefinition.fullName:
    case MediaServiceDefinition.fullName:
    case RedisAPIDefinition.fullName:
      return [NutritionCategory.DATA];

    case HTTPDefinition.fullName:
      return [NutritionCategory.HTTP];

    case ModlogDefinition.fullName:
      return [NutritionCategory.MODLOG];

    case SchedulerHandlerDefinition.fullName:
    case SchedulerDefinition.fullName:
      return [NutritionCategory.SCHEDULER];

    case OnAccountDeleteDefinition.fullName:
    case OnAppInstallDefinition.fullName:
    case OnAppUpgradeDefinition.fullName:
      return [NutritionCategory.APP_TRIGGERS];

    case OnCommentCreateDefinition.fullName:
    case OnCommentDeleteDefinition.fullName:
    case OnCommentReportDefinition.fullName:
    case OnCommentSubmitDefinition.fullName:
    case OnCommentUpdateDefinition.fullName:
    case OnModActionDefinition.fullName:
    case OnModMailDefinition.fullName:
    case OnPostCreateDefinition.fullName:
    case OnPostDeleteDefinition.fullName:
    case OnPostUpdateDefinition.fullName:
    case OnPostFlairUpdateDefinition.fullName:
    case OnPostReportDefinition.fullName:
    case OnPostSubmitDefinition.fullName:
    case OnSubredditSubscribeDefinition.fullName:
      return [NutritionCategory.REDDIT_TRIGGERS];

    case FlairDefinition.fullName:
    case GraphQLDefinition.fullName:
    case LinksAndCommentsDefinition.fullName:
    case ListingsDefinition.fullName:
    case ModerationDefinition.fullName:
    case ModNoteDefinition.fullName:
    case NewModmailDefinition.fullName:
    case PrivateMessagesDefinition.fullName:
    case SubredditsDefinition.fullName:
    case UsersDefinition.fullName:
    case WidgetsDefinition.fullName:
    case WikiDefinition.fullName:
      return [NutritionCategory.REDDIT_API];

    case UserActionsDefinition.fullName:
      return [NutritionCategory.USER_ACTIONS];

    case PaymentsServiceDefinition.fullName:
    case PaymentProcessorDefinition.fullName:
      return [NutritionCategory.PAYMENTS];
  }

  return [NutritionCategory.UNRECOGNIZED];
}
