import type { ModNoteObject } from '@devvit/protos/json/devvit/plugin/redditapi/modnote/modnote_msg.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { asTid, T1, T2, T3, T5 } from '@devvit/shared-types/tid.js';

import { getRedditApiPlugins } from '../plugin.js';
import type { ListingFetchOptions, ListingFetchResponse } from './Listing.js';
import { Listing } from './Listing.js';
import type { ModAction } from './ModAction.js';

export type ModNoteType =
  | 'NOTE'
  | 'APPROVAL'
  | 'REMOVAL'
  | 'BAN'
  | 'MUTE'
  | 'INVITE'
  | 'SPAM'
  | 'CONTENT_CHANGE'
  | 'MOD_ACTION'
  | 'ALL';

export type UserNoteLabel =
  | 'BOT_BAN'
  | 'PERMA_BAN'
  | 'BAN'
  | 'ABUSE_WARNING'
  | 'SPAM_WARNING'
  | 'SPAM_WATCH'
  | 'SOLID_CONTRIBUTOR'
  | 'HELPFUL_USER';

export type UserNote = {
  note?: string | undefined;
  redditId?: T1 | T3 | T5 | undefined;
  label?: UserNoteLabel | undefined;
};

export interface ModNote {
  id: string;
  operator: {
    id?: T2 | undefined;
    name?: string | undefined;
  };
  user: {
    id?: T2 | undefined;
    name?: string | undefined;
  };
  subreddit: {
    id?: T5 | undefined;
    name?: string | undefined;
  };
  type: ModNoteType;
  createdAt: Date;
  userNote?: UserNote | undefined;
  modAction?: ModAction;
}

/** Options for retrieving a user's moderation notes from a subreddit. */
export type GetModNotesOptions = {
  /** The subreddit name without the leading `r/`. */
  subreddit: string;
  /** The username without the leading `u/`. */
  user: string;
  /** The type of moderation notes to return. Defaults to all types. */
  filter?: ModNoteType;
  /**
   * The maximum total number of moderation notes to return.
   *
   * Accepts at most 100 notes per request. Omit this option to allow the
   * listing to paginate beyond the first 100 notes.
   */
  limit?: number;
  /** The pagination cursor before which results should be returned. */
  before?: string;
};

/** Options for adding a moderation note to a user. */
export type CreateModNoteOptions = {
  /** The subreddit name without the leading `r/`. */
  subreddit: string;
  /** The username without the leading `u/`. */
  user: string;
  /** The text of the moderation note. The maximum length is 250 characters. */
  note: string;
  /** A label that categorizes the moderation note. */
  label?: UserNoteLabel;
  /** The comment or post associated with the moderation note. */
  redditId?: T1 | T3;
};

/** Options for deleting a moderation note. */
export type DeleteNotesOptions = {
  /** The subreddit name without the leading `r/`. */
  subreddit: string;
  /** The unique moderation note identifier, including its `ModNote_` prefix. */
  noteId: string;
  /** The username without the leading `u/`. */
  user: string;
};

/**
 * Options for adding a note that explains why posts or comments were removed.
 */
export type AddRemovalNoteOptions = {
  /** The IDs of the removed posts or comments. */
  itemIds: string[];
  /**
   * The removal reason identifier, or an empty string when no removal reason is
   * used.
   */
  reasonId: string;
  /**
   * The note explaining the removal. The maximum length is 100 characters.
   *
   * The plugin omits this field when it is `undefined` or an empty string.
   */
  modNote?: string;
};

export class ModNote {
  /**
   * @internal
   */
  private constructor() {}

  static #fromProto(protoModNote: ModNoteObject): ModNote {
    // Check that all fields required to create a ModNote are present.
    assertNonNull(protoModNote.id, 'Mod note ID is null or undefined');
    assertNonNull(protoModNote.createdAt, 'Mod note createdAt is null or undefined');
    assertNonNull(protoModNote.type, 'Mod note type is null or undefined');
    assertNonNull(protoModNote.subreddit, 'Mod note subreddit is null or undefined');
    assertNonNull(protoModNote.subredditId, 'Mod note subredditId is null or undefined');
    assertNonNull(protoModNote.operator, 'Mod note operator is null or undefined');
    assertNonNull(protoModNote.operatorId, 'Mod note operatorId is null or undefined');
    assertNonNull(protoModNote.user, 'Mod note user is null or undefined');
    assertNonNull(protoModNote.userId, 'Mod note userId is null or undefined');
    assertNonNull(protoModNote.userNoteData, 'Mod note userNote is null or undefined');
    assertNonNull(protoModNote.modActionData, 'Mod note modAction is null or undefined');

    return {
      id: protoModNote.id,
      user: {
        id: T2(protoModNote.userId ?? ''),
        name: protoModNote.user,
      },
      subreddit: {
        id: T5(protoModNote.subredditId ?? ''),
        name: protoModNote.subreddit,
      },
      operator: {
        id: T2(protoModNote.operatorId ?? ''),
        name: protoModNote.operator,
      },
      createdAt: new Date(protoModNote.createdAt! * 1000), // convert to ms
      userNote: {
        note: protoModNote.userNoteData?.note,
        redditId: protoModNote.userNoteData?.redditId
          ? asTid<T1 | T3 | T5>(protoModNote.userNoteData?.redditId)
          : undefined,
        label: protoModNote.userNoteData?.label as UserNoteLabel,
      },
      type: protoModNote.type as ModNoteType,
    };
  }

  /** @internal */
  static get(options: GetModNotesOptions): Listing<ModNote> {
    const client = getRedditApiPlugins().ModNote;

    return new Listing<ModNote>({
      hasMore: true,
      before: options.before,
      limit: options.limit,
      pageSize: options.limit,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const protoRes = await client.GetNotes(
          {
            subreddit: options.subreddit,
            user: options.user,
            filter: options.filter,
            before: fetchOptions.before,
            limit: fetchOptions.limit,
          },
          this.#metadata
        );

        return {
          children: protoRes.modNotes?.map((protoModNote) => this.#fromProto(protoModNote)) || [],
          // Clear the cursor when the response says there are no more pages so
          // the listing does not make another request.
          before: protoRes.hasNextPage ? protoRes.endCursor : undefined,
          hasMore: protoRes.hasNextPage,
        } as ListingFetchResponse<ModNote>;
      },
    });
  }

  /** @internal */
  static async delete(options: DeleteNotesOptions): Promise<boolean> {
    const client = getRedditApiPlugins().ModNote;
    const { deleted } = await client.DeleteNotes(options, this.#metadata);
    return !!deleted;
  }

  /** @internal */
  static async add(options: CreateModNoteOptions): Promise<ModNote> {
    const client = getRedditApiPlugins().ModNote;
    const res = await client.PostNotes(options, this.#metadata);
    if (!res?.created) {
      throw new Error('Failed to create mod note');
    }
    return this.#fromProto(res.created);
  }

  /** @internal */
  static async addRemovalNote(options: AddRemovalNoteOptions): Promise<void> {
    const client = getRedditApiPlugins().ModNote;

    await client.PostRemovalNote(options, this.#metadata);
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}
