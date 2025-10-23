import type {
  DeleteNotesRequest,
  GetNotesRequest,
  Metadata,
  ModNoteObject,
  PostNotesRequest,
  PostRemovalNoteRequest,
} from '@devvit/protos';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';
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

export type GetModNotesOptions = Prettify<
  Pick<GetNotesRequest, 'subreddit' | 'user'> & {
    filter?: ModNoteType;
  } & Pick<ListingFetchOptions, 'limit' | 'before'>
>;

export type CreateModNoteOptions = Prettify<
  PostNotesRequest & {
    redditId?: T1 | T3;
    label?: UserNoteLabel;
  }
>;

export type DeleteNotesOptions = Prettify<DeleteNotesRequest>;

export type AddRemovalNoteOptions = Prettify<PostRemovalNoteRequest>;

export class ModNote {
  /**
   * @internal
   */
  private constructor() {}

  static #fromProto(protoModNote: ModNoteObject): ModNote {
    // check that all required fields of protoModNote needed to create a ModNote are present
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
          // if the response says that there are no more pages, then we should set before to undefined
          // to prevent more requests from being made
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
