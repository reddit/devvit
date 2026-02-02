import { KVStoreDefinition, type LinkedBundle, SchedulerDefinition } from '@devvit/protos/index.js';
import { NutritionCategory } from '@devvit/protos/json/devvit/dev_portal/nutrition/nutrition.js';
// eslint-disable-next-line no-restricted-imports
import {
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
} from '@devvit/protos/types/devvit/actor/automation/v1alpha/event_handlers.js';
// eslint-disable-next-line no-restricted-imports
import {
  OnAccountDeleteDefinition,
  OnSubredditSubscribeDefinition,
} from '@devvit/protos/types/devvit/actor/automation/v1alpha/event_handlers.js';
// eslint-disable-next-line no-restricted-imports
import { PaymentProcessorDefinition } from '@devvit/protos/types/devvit/actor/payments/v1alpha/payments.js';
// eslint-disable-next-line no-restricted-imports
import { ContextActionDefinition } from '@devvit/protos/types/devvit/actor/reddit/context_action.js';
// eslint-disable-next-line no-restricted-imports
import { SchedulerHandlerDefinition } from '@devvit/protos/types/devvit/actor/scheduler/handler.js';
// eslint-disable-next-line no-restricted-imports
import { InstallationSettingsDefinition } from '@devvit/protos/types/devvit/actor/settings/v1alpha/installation_settings.js';
// eslint-disable-next-line no-restricted-imports
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
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
  const hasWebView = version.assets?.some((asset) => asset.webviewAsset) ?? false;
  const capabilities = version.actors.flatMap((actor) =>
    appCapabilitiesFromActor({
      actorTypes: actor.types,
      actorPlugins: actor.plugins,
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
  hasWebView,
}: {
  actorTypes: Readonly<AppActorTypes>;
  actorPlugins: Readonly<AppActorPlugins>;
  hasWebView: boolean;
}): NutritionCategory[] {
  const names = [
    ...actorTypes.map((provide) => provide.name),
    ...actorPlugins.map((use) => use.fullname),
  ];
  return appCapabilitiesFromFullNames(names, hasWebView);
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

  const hasWebview = Object.keys(bundle.webviewAssets).length > 0;
  return appCapabilitiesFromFullNames(names, hasWebview);
}

/**
 * Finds all of the capabilities that an app has based on its bundle.
 */
export function appCapabilitiesFromBundle(bundle: Readonly<Bundle>): NutritionCategory[] {
  const names = [
    ...(bundle.dependencies?.provides ?? []).map((provide) => provide.definition?.fullName ?? ''),
    ...(bundle.dependencies?.uses ?? []).map((use) => use.typeName),
  ];
  const hasWebview = Object.keys(bundle.webviewAssetIds).length > 0;

  return appCapabilitiesFromFullNames(names, hasWebview);
}

function appCapabilitiesFromFullNames(
  fullNames: readonly string[],
  hasWebview: boolean
): NutritionCategory[] {
  const appCapabilities = fullNames
    .flatMap((name) => appCapabilityFromFullName(name))
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
function appCapabilityFromFullName(fullName: string): (NutritionCategory | undefined)[] {
  switch (fullName) {
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
