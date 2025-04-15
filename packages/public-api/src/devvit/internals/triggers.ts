import type { Metadata } from '@devvit/protos';
import {
  HandlerResult,
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
} from '@devvit/protos';
import type {
  OnAppInstall,
  OnAppUpgrade,
  OnAutomoderatorFilterComment,
  OnAutomoderatorFilterPost,
  OnCommentCreate,
  OnCommentDelete,
  OnCommentReport,
  OnCommentSubmit,
  OnCommentUpdate,
  OnModAction,
  OnModMail,
  OnPostCreate,
  OnPostDelete,
  OnPostFlairUpdate,
  OnPostNsfwUpdate,
  OnPostReport,
  OnPostSpoilerUpdate,
  OnPostSubmit,
  OnPostUpdate,
} from '@devvit/protos/types/devvit/actor/automation/v1alpha/event_handlers.js';
import type { Config } from '@devvit/shared-types/Config.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

import { makeAPIClients } from '../../apis/makeAPIClients.js';
import type { TriggerEvent, TriggerOnEventHandler } from '../../types/triggers.js';
import { Devvit } from '../Devvit.js';
import { getContextFromMetadata } from './context.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';

function createCombinedHandler<Arg>(
  eventType: TriggerEvent,
  handlers: TriggerOnEventHandler<Arg>[] | undefined
): (arg: Arg, metadata: Metadata) => Promise<HandlerResult> {
  assertNonNull(handlers);
  return async (arg, metadata) => {
    const event = {
      ...arg,
      type: eventType,
    };

    const context = Object.assign(
      makeAPIClients({
        metadata,
      }),
      getContextFromMetadata(metadata)
    );

    // Users can set multiple triggers for a single event. An error in one
    // shouldn't technically impact another but there's no actual guarantees
    // made around this.
    const results = await Promise.allSettled(handlers.map((fn) => fn(event, context)));
    // Throw any failed promises so that the EnvelopeClient will surface them to
    // the user.
    const errResult = joinSettledErrors(results);
    if (errResult) throw errResult.err;

    return {};
  };
}

export function registerTriggers(config: Config): void {
  for (const event of Devvit.triggerOnEventHandlers.keys()) {
    switch (event) {
      case 'PostSubmit':
        config.provides(OnPostSubmitDefinition);
        extendDevvitPrototype<OnPostSubmit>(
          'OnPostSubmit',
          createCombinedHandler('PostSubmit', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostCreate':
        config.provides(OnPostCreateDefinition);
        extendDevvitPrototype<OnPostCreate>(
          'OnPostCreate',
          createCombinedHandler('PostCreate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostUpdate':
        config.provides(OnPostUpdateDefinition);
        extendDevvitPrototype<OnPostUpdate>(
          'OnPostUpdate',
          createCombinedHandler('PostUpdate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostReport':
        config.provides(OnPostReportDefinition);
        extendDevvitPrototype<OnPostReport>(
          'OnPostReport',
          createCombinedHandler('PostReport', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostDelete':
        config.provides(OnPostDeleteDefinition);
        extendDevvitPrototype<OnPostDelete>(
          'OnPostDelete',
          createCombinedHandler('PostDelete', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostFlairUpdate':
        config.provides(OnPostFlairUpdateDefinition);
        extendDevvitPrototype<OnPostFlairUpdate>(
          'OnPostFlairUpdate',
          createCombinedHandler('PostFlairUpdate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'CommentSubmit':
        config.provides(OnCommentSubmitDefinition);
        extendDevvitPrototype<OnCommentSubmit>(
          'OnCommentSubmit',
          createCombinedHandler('CommentSubmit', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'CommentCreate':
        config.provides(OnCommentCreateDefinition);
        extendDevvitPrototype<OnCommentCreate>(
          'OnCommentCreate',
          createCombinedHandler('CommentCreate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'CommentUpdate':
        config.provides(OnCommentUpdateDefinition);
        extendDevvitPrototype<OnCommentUpdate>(
          'OnCommentUpdate',
          createCombinedHandler('CommentUpdate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'CommentReport':
        config.provides(OnCommentReportDefinition);
        extendDevvitPrototype<OnCommentReport>(
          'OnCommentReport',
          createCombinedHandler('CommentReport', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'CommentDelete':
        config.provides(OnCommentDeleteDefinition);
        extendDevvitPrototype<OnCommentDelete>(
          'OnCommentDelete',
          createCombinedHandler('CommentDelete', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'AppInstall':
        config.provides(OnAppInstallDefinition);
        extendDevvitPrototype<OnAppInstall>(
          'OnAppInstall',
          createCombinedHandler('AppInstall', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'AppUpgrade':
        config.provides(OnAppUpgradeDefinition);
        extendDevvitPrototype<OnAppUpgrade>(
          'OnAppUpgrade',
          createCombinedHandler('AppUpgrade', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'ModAction':
        config.provides(OnModActionDefinition);
        extendDevvitPrototype<OnModAction>(
          'OnModAction',
          createCombinedHandler('ModAction', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'ModMail':
        config.provides(OnModMailDefinition);
        extendDevvitPrototype<OnModMail>(
          'OnModMail',
          createCombinedHandler('ModMail', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostNsfwUpdate':
        config.provides(OnPostNsfwUpdateDefinition);
        extendDevvitPrototype<OnPostNsfwUpdate>(
          'OnPostNsfwUpdate',
          createCombinedHandler('PostNsfwUpdate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'PostSpoilerUpdate':
        config.provides(OnPostSpoilerUpdateDefinition);
        extendDevvitPrototype<OnPostSpoilerUpdate>(
          'OnPostSpoilerUpdate',
          createCombinedHandler('PostSpoilerUpdate', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'AutomoderatorFilterPost':
        config.provides(OnAutomoderatorFilterPostDefinition);
        extendDevvitPrototype<OnAutomoderatorFilterPost>(
          'OnAutomoderatorFilterPost',
          createCombinedHandler('AutomoderatorFilterPost', Devvit.triggerOnEventHandlers.get(event))
        );
        break;
      case 'AutomoderatorFilterComment':
        config.provides(OnAutomoderatorFilterCommentDefinition);
        extendDevvitPrototype<OnAutomoderatorFilterComment>(
          'OnAutomoderatorFilterComment',
          createCombinedHandler(
            'AutomoderatorFilterComment',
            Devvit.triggerOnEventHandlers.get(event)
          )
        );
        break;

      default:
        throw new Error(`Unknown trigger event: ${event}`);
    }
  }
}

function joinSettledErrors(results: PromiseSettledResult<unknown>[]): { err: unknown } | undefined {
  const errs = results.reduce(
    (sum, result) => (result.status === 'rejected' ? [...sum, result.reason] : sum),
    [] as unknown[]
  );
  if (errs.length === 0) return;
  if (errs.length === 1) return { err: errs[0] }; // Return original error.
  // The return type is a wrapper just to prevent ambiguity over nullish
  // rejections which some parts of our code have mistakenly done historically.
  return { err: new Error(errs.map((err) => StringUtil.caughtToString(err)).join('\n')) };
}
