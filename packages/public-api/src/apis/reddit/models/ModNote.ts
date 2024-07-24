import type {
  DeleteNotesRequest,
  GetNotesRequest,
  Metadata,
  ModNoteObject,
  PostNotesRequest,
  PostRemovalNoteRequest,
} from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';
import type { T1ID, T2ID, T3ID, T5ID } from '@devvit/shared-types/tid.js';
import { asT2ID, asT5ID, asTID } from '@devvit/shared-types/tid.js';
import { Devvit } from '../../../devvit/Devvit.js';
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

function validateUserNoteLabel(str: string): str is UserNoteLabel {
  try {
    str as UserNoteLabel;
    return true;
  } catch {
    return false;
  }
}

function validateModNoteType(str: string): str is ModNoteType {
  try {
    str as ModNoteType;
    return true;
  } catch {
    return false;
  }
}

export type UserNote = {
  note?: string;
  redditId: T1ID | T3ID | T5ID;
  label?: UserNoteLabel;
};

export interface ModNote {
  id: string;
  operator: {
    id?: T2ID | undefined;
    name?: string | undefined;
  };
  user: {
    id?: T2ID | undefined;
    name?: string | undefined;
  };
  subreddit: {
    id?: T5ID | undefined;
    name?: string | undefined;
  };
  type: ModNoteType;
  createdAt: Date;
  userNote?: UserNote;
  modAction?: ModAction;
}

export type GetModNotesOptions = Prettify<
  Pick<GetNotesRequest, 'subreddit' | 'user'> & {
    filter?: ModNoteType;
  } & Pick<ListingFetchOptions, 'limit' | 'before'>
>;

export type CreateModNoteOptions = Prettify<
  PostNotesRequest & {
    redditId?: T1ID | T3ID;
    label: UserNoteLabel;
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

    // check that userNoteData label is valid
    if (!validateUserNoteLabel(protoModNote.userNoteData?.label ?? '')) {
      throw new Error(`Invalid user note label: ${protoModNote.userNoteData?.label}`);
    }
    if (!validateModNoteType(protoModNote.type)) {
      throw new Error(`Invalid mod note type: ${protoModNote.type}`);
    }

    return {
      id: protoModNote.id,
      user: {
        id: asT2ID(protoModNote.userId ?? ''),
        name: protoModNote.user,
      },
      subreddit: {
        id: asT5ID(protoModNote.subredditId ?? ''),
        name: protoModNote.subreddit,
      },
      operator: {
        id: asT2ID(protoModNote.operatorId ?? ''),
        name: protoModNote.operator,
      },
      createdAt: new Date(protoModNote.createdAt! * 1000), // convert to ms
      userNote: {
        note: protoModNote.userNoteData?.note,
        redditId: asTID<T1ID | T3ID | T5ID>(protoModNote.userNoteData?.redditId ?? ''),
        label: protoModNote.userNoteData?.label as UserNoteLabel,
      },
      type: protoModNote.type as ModNoteType,
    };
  }

  /** @internal */
  static get(options: GetModNotesOptions, metadata: Metadata | undefined): Listing<ModNote> {
    const client = Devvit.redditAPIPlugins.ModNote;

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
          metadata
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
  static async delete(
    options: DeleteNotesOptions,
    metadata: Metadata | undefined
  ): Promise<boolean> {
    const client = Devvit.redditAPIPlugins.ModNote;
    const { deleted } = await client.DeleteNotes(options, metadata);
    return !!deleted;
  }

  /** @internal */
  static async add(
    options: CreateModNoteOptions,
    metadata: Metadata | undefined
  ): Promise<ModNote> {
    const client = Devvit.redditAPIPlugins.ModNote;
    const res = await client.PostNotes(options, metadata);
    if (!res?.created) {
      throw new Error('Failed to create mod note');
    }
    return this.#fromProto(res.created);
  }

  /** @internal */
  static async addRemovalNote(
    options: AddRemovalNoteOptions,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.ModNote;

    await client.PostRemovalNote(options, metadata);
  }
}
