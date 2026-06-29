import { Header } from '@devvit/shared-types/Header.js';

import type { getEffectsFromUIClient } from '../../apis/ui/helpers/getEffectsFromUIClient.js';
import type { BaseContext, ContextAPIClients } from '../../types/context.js';

type FormSubmitGrant = {
  openedAt: number;
};

const FORM_SUBMIT_GRANT_TTL_SECONDS = 600;
const FORM_SUBMIT_GRANT_KEY_PREFIX = 'devvit:form-submit-grant';

function getUserHeader(context: BaseContext & ContextAPIClients): string {
  const userHeader = context.metadata[Header.User].values[0];
  if (!userHeader) {
    throw new Error('User missing from context');
  }
  return userHeader;
}

function getSubredditHeader(context: BaseContext & ContextAPIClients): string {
  const subredditHeader = context.metadata[Header.Subreddit].values[0];
  if (!subredditHeader) {
    throw new Error('Subreddit missing from context');
  }
  return subredditHeader;
}

function getFormSubmitGrantKey(context: BaseContext & ContextAPIClients, formId: string): string {
  const userHeader = getUserHeader(context);
  const subredditHeader = getSubredditHeader(context);
  const keyParts = [userHeader, subredditHeader, formId].join(':');
  return `${FORM_SUBMIT_GRANT_KEY_PREFIX}:${keyParts}`;
}

function getFormGrantExpiration(): Date {
  return new Date(Date.now() + FORM_SUBMIT_GRANT_TTL_SECONDS * 1000);
}

export function getFormIdsFromEffects(
  effects: ReturnType<typeof getEffectsFromUIClient>
): string[] {
  return effects.flatMap((effect) => {
    const formId = effect.showForm?.form?.id;
    return formId ? [formId] : [];
  });
}

export async function addFormSubmitGrants(
  context: BaseContext & ContextAPIClients,
  formIds: readonly string[]
) {
  const grant: FormSubmitGrant = {
    openedAt: Date.now(),
  };

  for (const formId of new Set(formIds)) {
    const key = getFormSubmitGrantKey(context, formId);
    await context.redis.set(key, JSON.stringify(grant), { expiration: getFormGrantExpiration() });
  }
}

export async function validateFormSubmitGrant(
  context: BaseContext & ContextAPIClients,
  formId: string
) {
  const grantData = await context.redis.get(getFormSubmitGrantKey(context, formId));
  if (!grantData) {
    throw new Error(`Form ${formId} was not opened by this user in this subreddit`);
  }
}
