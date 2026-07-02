import type { User as UserProto } from '@devvit/protos/json/devvit/reddit/user.js';
import { describe, expect, test } from 'vitest';

import type { ModeratorPermission } from './User.js';
import {
  SubredditBannedUser,
  SubredditContributorUser,
  SubredditModeratorUser,
  SubredditMutedUser,
  SubredditWikiBannedUser,
  SubredditWikiContributorUser,
} from './User.js';

const createdUtc = 1_712_345_678;
const relationshipDate = new Date('2024-04-05T06:07:08.000Z');
const subredditName = 'testsubreddit';
const moderatorPermissions: ModeratorPermission[] = ['posts', 'wiki'];

const userData = {
  id: 'abc123',
  name: 'test_user',
  createdUtc,
  linkKarma: 123,
  commentKarma: 456,
  over18: true,
  snoovatarSize: [],
} satisfies UserProto;

const expectedUserFields = {
  id: 't2_abc123',
  username: 'test_user',
  createdAt: new Date(createdUtc * 1000),
  linkKarma: 123,
  commentKarma: 456,
  nsfw: false,
  modPermissionsBySubreddit: {},
};

type SubredditRelationshipUser =
  | SubredditBannedUser
  | SubredditMutedUser
  | SubredditWikiBannedUser
  | SubredditContributorUser
  | SubredditWikiContributorUser
  | SubredditModeratorUser;

type ConstructorTestCase = {
  name: string;
  create: () => SubredditRelationshipUser;
  expected: Record<string, unknown>;
};

function subredditRelationshipUserOutput(user: SubredditRelationshipUser): Record<string, unknown> {
  const output: Record<string, unknown> = {
    ...user.toJSON(),
    date: user.date,
  };

  if (user instanceof SubredditBannedUser || user instanceof SubredditWikiBannedUser) {
    output.note = user.note;
    output.daysLeft = user.daysLeft;
  }

  if (user instanceof SubredditModeratorUser) {
    output.moderatorInfo = user.moderatorInfo;
  }

  return output;
}

describe('subreddit relationship user constructors', () => {
  const testCases: ConstructorTestCase[] = [
    {
      name: 'SubredditBannedUser',
      create: () =>
        new SubredditBannedUser(userData, {
          date: relationshipDate,
          note: 'spam',
          daysLeft: 7,
        }),
      expected: {
        ...expectedUserFields,
        date: relationshipDate,
        note: 'spam',
        daysLeft: 7,
      },
    },
    {
      name: 'SubredditMutedUser',
      create: () => new SubredditMutedUser(userData, { date: relationshipDate }),
      expected: {
        ...expectedUserFields,
        date: relationshipDate,
      },
    },
    {
      name: 'SubredditWikiBannedUser',
      create: () =>
        new SubredditWikiBannedUser(userData, {
          date: relationshipDate,
          note: undefined,
          daysLeft: undefined,
        }),
      expected: {
        ...expectedUserFields,
        date: relationshipDate,
        note: undefined,
        daysLeft: undefined,
      },
    },
    {
      name: 'SubredditContributorUser',
      create: () => new SubredditContributorUser(userData, { date: relationshipDate }),
      expected: {
        ...expectedUserFields,
        date: relationshipDate,
      },
    },
    {
      name: 'SubredditWikiContributorUser',
      create: () => new SubredditWikiContributorUser(userData, { date: relationshipDate }),
      expected: {
        ...expectedUserFields,
        date: relationshipDate,
      },
    },
    {
      name: 'SubredditModeratorUser',
      create: () =>
        new SubredditModeratorUser(userData, {
          date: relationshipDate,
          subredditName,
          modPermissions: moderatorPermissions,
          authorFlairCssClass: 'helper',
          authorFlairText: 'Helpful',
        }),
      expected: {
        ...expectedUserFields,
        modPermissionsBySubreddit: {
          [subredditName]: moderatorPermissions,
        },
        date: relationshipDate,
        moderatorInfo: {
          modPermissions: moderatorPermissions,
          authorFlairCssClass: 'helper',
          authorFlairText: 'Helpful',
        },
      },
    },
  ];

  for (const testCase of testCases) {
    test(`${testCase.name} maps constructor data`, () => {
      expect(subredditRelationshipUserOutput(testCase.create())).toStrictEqual(testCase.expected);
    });
  }
});
