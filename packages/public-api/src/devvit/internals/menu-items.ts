import type { ContextActionList, ContextActionRequest, Empty, Metadata } from '@devvit/protos';
import {
  ContextActionDefinition,
  ContextActionDescription,
  ContextActionResponse,
} from '@devvit/protos';
import type { DeepPartial } from '@devvit/shared-types/BuiltinTypes.js';
import type { Config } from '@devvit/shared-types/Config.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { makeAPIClients } from '../../apis/makeAPIClients.js';
import { getEffectsFromUIClient } from '../../apis/ui/helpers/getEffectsFromUIClient.js';
import type { MenuItem, MenuItemOnPressEvent } from '../../types/menu-item.js';
import { Devvit } from '../Devvit.js';
import { getContextFromMetadata } from './context.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { Header } from '@devvit/shared-types/Header.js';

const getActionId = (index: number): string => {
  return `menuItem.${index}`;
};

export function getMenuItemById(id: string): MenuItem | undefined {
  return Devvit.menuItems.find((_, index) => getActionId(index) === id);
}

async function getActions(
  _: Empty,
  _metadata: Metadata | undefined
): Promise<DeepPartial<ContextActionList>> {
  const menuItems = Devvit.menuItems;

  if (!menuItems.length) {
    throw new Error('No menu items registered.');
  }

  const actions = menuItems.map((item, index) => {
    return ContextActionDescription.fromPartial({
      actionId: getActionId(index),
      name: item.label,
      description: item.description,
      contexts: {
        subreddit: item.location.includes('subreddit'),
        post: item.location.includes('post'),
        comment: item.location.includes('comment'),
      },
      users: {
        loggedOut: item.forUserType?.includes('loggedOut'),
        member: item.forUserType?.includes('member'),
        moderator: item.forUserType?.includes('moderator'),
      },
      postFilters: item.postFilter === 'currentApp' ? { currentApp: true } : undefined,
    });
  });

  return { actions };
}

async function onAction(
  req: ContextActionRequest,
  metadata: Metadata
): Promise<ContextActionResponse> {
  const menuItem = getMenuItemById(req.actionId);

  if (!menuItem) {
    throw new Error(`MenuItem ${req.actionId} not found`);
  }

  const commentId = req.comment?.id && `t1_${req.comment.id}`;
  const postId = req.post?.id && `t3_${req.post.id}`;
  const subredditId = req.subreddit?.id && `t5_${req.subreddit.id}`;
  const targetId = commentId || postId || subredditId;
  assertNonNull(targetId, 'targetId is missing from ContextActionRequest');

  const event: MenuItemOnPressEvent = {
    targetId,
    location: req.comment ? 'comment' : req.post ? 'post' : 'subreddit',
  };

  const context = Object.assign(
    makeAPIClients({
      ui: true,
      metadata,
    }),
    getContextFromMetadata(metadata, postId, commentId),
    {
      uiEnvironment: {
        timezone: metadata[Header.Timezone]?.values[0],
        locale: metadata[Header.Language]?.values[0],
      },
    }
  );

  await menuItem.onPress(event, context);

  return ContextActionResponse.fromPartial({
    effects: getEffectsFromUIClient(context.ui),
  });
}

export function registerMenuItems(config: Config): void {
  config.provides(ContextActionDefinition);
  extendDevvitPrototype('GetActions', getActions);
  extendDevvitPrototype('OnAction', onAction);
}
