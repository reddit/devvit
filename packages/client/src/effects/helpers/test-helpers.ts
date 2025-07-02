import type { Effect, EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type { Comment, Post, Subreddit, User } from '@devvit/reddit';

import type { Form, FormFieldGroup, SelectField, StringField } from './form-types.js';

// Thing mocks

export const mockSubreddit = {
  id: 't5_123',
  name: 'test',
  permalink: '/r/test',
  createdAt: new Date(),
  type: 'public',
  title: 'Test Subreddit',
  description: 'A test subreddit',
  language: 'en',
  nsfw: false,
  numberOfSubscribers: 1000,
  numberOfActiveUsers: 100,
  settings: {
    acceptFollowers: true,
    allOriginalContent: false,
    allowChatPostCreation: true,
    allowDiscovery: true,
    allowGalleries: true,
    allowImages: true,
    allowPolls: true,
    allowPredictionContributors: true,
    allowPredictions: true,
    allowPredictionsTournament: true,
    allowTalks: true,
    allowVideoGifs: true,
    allowVideos: true,
    chatPostEnabled: true,
    collectionsEnabled: true,
    crosspostable: true,
    emojisEnabled: true,
    eventPostsEnabled: true,
    linkFlairEnabled: true,
    originalContentTagEnabled: true,
    restrictCommenting: false,
    restrictPosting: false,
    shouldArchivePosts: true,
    spoilersEnabled: true,
    wikiEnabled: true,
    allowedPostType: 'any',
    allowedMediaInComments: ['giphy', 'static', 'animated', 'expression'],
    userFlairs: {
      enabled: true,
      usersCanAssign: true,
    },
    postFlairs: {
      enabled: true,
      usersCanAssign: true,
    },
    url: 'https://www.reddit.com/r/test',
  },
  url: 'https://www.reddit.com/r/test',
} as const as unknown as Readonly<Subreddit>;

export const mockPost = {
  id: 't3_123',
  title: 'Test Post',
  permalink: '/r/test/comments/123/test_post',
  authorId: 't2_456',
  authorName: 'testuser',
  subredditId: 't5_123',
  subredditName: 'test',
  body: 'Test post body',
  bodyHtml: '<div>Test post body</div>',
  url: 'https://www.reddit.com/r/test/comments/123/test_post',
  createdAt: new Date(),
  score: 100,
  numberOfComments: 10,
  numberOfReports: 0,
  approved: true,
  spam: false,
  stickied: false,
  removed: false,
  removedBy: undefined,
  removedByCategory: undefined,
  archived: false,
  edited: false,
  locked: false,
  nsfw: false,
  quarantined: false,
  spoiler: false,
  hidden: false,
  ignoringReports: false,
  distinguishedBy: undefined,
  flair: undefined,
  secureMedia: undefined,
  userReportReasons: [],
  modReportReasons: [],
} as unknown as Readonly<Post>;

export const mockComment = {
  id: 't1_123',
  body: 'Test comment',
  permalink: '/r/test/comments/123/test_post/comment',
  authorId: 't2_456',
  authorName: 'testuser',
  subredditId: 't5_123',
  subredditName: 'test',
  createdAt: new Date(),
  parentId: 't3_123',
  postId: 't3_123',
  approved: true,
  locked: false,
  removed: false,
  stickied: false,
  spam: false,
  edited: false,
  distinguishedBy: undefined,
  numReports: 0,
  collapsedBecauseCrowdControl: false,
  score: 10,
  userReportReasons: [],
  modReportReasons: [],
  url: 'https://www.reddit.com/r/test/comments/123/test_post/comment',
  ignoringReports: false,
} as unknown as Readonly<Comment>;

export const mockUser = {
  id: 't2_123',
  username: 'testuser',
  createdAt: new Date(),
  linkKarma: 1000,
  commentKarma: 500,
  nsfw: false,
  isAdmin: false,
  modPermissions: new Map(),
  url: 'https://www.reddit.com/user/testuser',
  permalink: '/user/testuser',
  hasVerifiedEmail: true,
} as unknown as Readonly<User>;

// Forms

export const basicFormDefinition: Readonly<Form> = {
  title: 'Test Form',
  description: 'A test form',
  acceptLabel: 'Submit',
  cancelLabel: 'Cancel',
  fields: [
    {
      type: 'string',
      name: 'username',
      label: 'Username',
    },
  ],
};

export const complexFormDefinition: Readonly<Form> = {
  title: 'Complex Form',
  description: 'A form with multiple field types',
  acceptLabel: 'Submit',
  cancelLabel: 'Cancel',
  fields: [
    {
      type: 'string',
      name: 'name',
      label: 'Name',
    },
    {
      type: 'number',
      name: 'age',
      label: 'Age',
    },
    {
      type: 'select',
      name: 'color',
      label: 'Favorite Color',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
      ],
    },
  ],
};

export const expectedShowFormMessage = (form: Readonly<Form>): Effect => ({
  showForm: {
    form: {
      id: expect.stringMatching(/^form\.\d+$/),
      title: form.title,
      shortDescription: form.description,
      acceptLabel: form.acceptLabel,
      cancelLabel: form.cancelLabel,
      fields: form.fields.map((field) => {
        if (field.type === 'group') {
          const group = field as FormFieldGroup;
          return {
            fieldId: group.label,
            fieldType: 6, // GROUP
            label: group.label,
            helpText: group.helpText,
            defaultValue: {
              fieldType: 6,
              groupValue: {},
            },
            fieldConfig: {},
          };
        }

        const baseField = {
          fieldId: field.name,
          label: field.label,
          disabled: field.disabled,
          helpText: field.helpText,
        };

        if (field.type === 'string') {
          return {
            ...baseField,
            fieldType: 0,
            isSecret: (field as StringField).isSecret,
            required: 'required' in field ? field.required : undefined,
            defaultValue: {
              fieldType: 0,
              stringValue: undefined,
            },
            fieldConfig: {
              stringConfig: {
                placeholder: undefined,
              },
            },
          };
        }

        if (field.type === 'number') {
          return {
            ...baseField,
            fieldType: 2,
            required: 'required' in field ? field.required : undefined,
            defaultValue: {
              fieldType: 2,
              numberValue: undefined,
            },
            fieldConfig: {
              numberConfig: {},
            },
          };
        }

        if (field.type === 'select') {
          return {
            ...baseField,
            fieldType: 5,
            required: 'required' in field ? field.required : undefined,
            defaultValue: {
              fieldType: 5,
              selectionValue: {
                values: [],
              },
            },
            fieldConfig: {
              selectionConfig: {
                choices: (field as SelectField).options,
                multiSelect: undefined,
              },
            },
          };
        }

        throw new Error(`Unsupported field type: ${field.type}`);
      }),
    },
  },
  type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
});
