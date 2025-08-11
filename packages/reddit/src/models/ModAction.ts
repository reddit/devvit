import type { AboutLogResponse } from '@devvit/protos';
import { context } from '@devvit/server';
import type { T2, T5 } from '@devvit/shared';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { getRedditApiPlugins } from '../plugin.js';
import type { ListingFetchOptions, ListingFetchResponse } from './Listing.js';
import { Listing } from './Listing.js';

export type ModActionTarget = {
  id: string;
  author?: string | undefined;
  body?: string | undefined;
  permalink?: string | undefined;
  title?: string | undefined;
};

export interface ModAction {
  id: string;
  type: ModActionType;
  moderatorName: string;
  moderatorId: T2;
  createdAt: Date;
  subredditName: string;
  subredditId: T5;
  description?: string | undefined;
  details?: string | undefined;
  target?: ModActionTarget | undefined;
}

export type ModActionType =
  | 'banuser'
  | 'unbanuser'
  | 'spamlink'
  | 'removelink'
  | 'approvelink'
  | 'spamcomment'
  | 'removecomment'
  | 'approvecomment'
  | 'addmoderator'
  | 'showcomment'
  | 'invitemoderator'
  | 'uninvitemoderator'
  | 'acceptmoderatorinvite'
  | 'removemoderator'
  | 'addcontributor'
  | 'removecontributor'
  | 'editsettings'
  | 'editflair'
  | 'distinguish'
  | 'marknsfw'
  | 'wikibanned'
  | 'wikicontributor'
  | 'wikiunbanned'
  | 'wikipagelisted'
  | 'removewikicontributor'
  | 'wikirevise'
  | 'wikipermlevel'
  | 'ignorereports'
  | 'unignorereports'
  | 'setpermissions'
  | 'setsuggestedsort'
  | 'sticky'
  | 'unsticky'
  | 'setcontestmode'
  | 'unsetcontestmode'
  | 'lock'
  | 'unlock'
  | 'muteuser'
  | 'unmuteuser'
  | 'createrule'
  | 'editrule'
  | 'reorderrules'
  | 'deleterule'
  | 'spoiler'
  | 'unspoiler'
  | 'modmail_enrollment'
  | 'community_styling'
  | 'community_widgets'
  | 'markoriginalcontent'
  | 'collections'
  | 'events'
  | 'create_award'
  | 'disable_award'
  | 'delete_award'
  | 'enable_award'
  | 'mod_award_given'
  | 'hidden_award'
  | 'add_community_topics'
  | 'remove_community_topics'
  | 'create_scheduled_post'
  | 'edit_scheduled_post'
  | 'delete_scheduled_post'
  | 'submit_scheduled_post'
  | 'edit_post_requirements'
  | 'invitesubscriber'
  | 'submit_content_rating_survey'
  | 'adjust_post_crowd_control_level'
  | 'enable_post_crowd_control_filter'
  | 'disable_post_crowd_control_filter'
  | 'deleteoverriddenclassification'
  | 'overrideclassification'
  | 'reordermoderators'
  | 'snoozereports'
  | 'unsnoozereports'
  | 'addnote'
  | 'deletenote'
  | 'addremovalreason'
  | 'createremovalreason'
  | 'updateremovalreason'
  | 'deleteremovalreason'
  | 'reorderremovalreason'
  | 'dev_platform_app_changed'
  | 'dev_platform_app_disabled'
  | 'dev_platform_app_enabled'
  | 'dev_platform_app_installed'
  | 'dev_platform_app_uninstalled';

export type GetModerationLogOptions = ListingFetchOptions & {
  /** Subreddit name */
  subredditName: string;
  /** (optional) A moderator filter. Accepts an array of usernames */
  moderatorUsernames?: string[];
  /** Type of the Moderator action */
  type?: ModActionType;
};

export function getModerationLog(options: GetModerationLogOptions): Listing<ModAction> {
  const client = getRedditApiPlugins().Moderation;

  return new Listing({
    hasMore: true,
    after: options.after,
    before: options.before,
    limit: options.limit,
    pageSize: options.pageSize,
    fetch: async (fetchOptions: ListingFetchOptions) => {
      const response = await client.AboutLog(
        {
          subreddit: options.subredditName,
          mod: options.moderatorUsernames ? options.moderatorUsernames.join(',') : undefined,
          type: options.type,
          ...fetchOptions,
        },
        context.metadata
      );

      return aboutLogResponseToModActions(response);
    },
  });
}

function aboutLogResponseToModActions(response: AboutLogResponse): ListingFetchResponse<ModAction> {
  if (!response.data?.children) {
    throw new Error('AboutLogResponse is missing children');
  }

  const children = response.data.children.map((child) => {
    if (!child.data) {
      throw new Error('ModAction from AboutLogResponse is missing or invalid');
    }

    const {
      id,
      mod,
      modId36,
      createdUtc,
      subreddit,
      subredditNamePrefixed,
      action,
      srId36,
      description,
      details,
      targetAuthor,
      targetBody,
      targetFullname,
      targetPermalink,
      targetTitle,
    } = child.data;

    assertNonNull(id, 'ModAction from AboutLogResponse is missing id');
    assertNonNull(mod, 'ModAction from AboutLogResponse is missing mod');
    assertNonNull(modId36, 'ModAction from AboutLogResponse is missing modId36');
    assertNonNull(createdUtc, 'ModAction from AboutLogResponse is missing createdUtc');
    assertNonNull(subreddit, 'ModAction from AboutLogResponse is missing subreddit');
    assertNonNull(
      subredditNamePrefixed,
      'ModAction from AboutLogResponse is missing subredditNamePrefixed'
    );
    assertNonNull(action, 'ModAction from AboutLogResponse is missing action');
    assertNonNull(srId36, 'ModAction from AboutLogResponse is missing srId36');

    const createdAt = new Date(0);
    createdAt.setUTCSeconds(createdUtc);

    const modAction: ModAction = {
      id,
      type: action as ModActionType,
      moderatorName: mod,
      moderatorId: `t2_${modId36}`,
      createdAt,
      subredditName: subreddit,
      subredditId: `t5_${srId36}`,
      description,
      details,
      target: targetFullname
        ? {
            id: targetFullname,
            author: targetAuthor,
            body: targetBody,
            permalink: targetPermalink,
            title: targetTitle,
          }
        : undefined,
    };

    return modAction;
  });

  return {
    children,
    after: response.data.after,
    before: response.data.before,
  };
}
