import type { Metadata, RedditObject } from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';

import { Devvit } from '../../../devvit/Devvit.js';
import type { T2ID, T5ID, TID } from '../../../types/tid.js';
import { asT2ID, asT5ID, asTID } from '../../../types/tid.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import type { ListingFetchOptions } from './Listing.js';
import { Listing } from './Listing.js';
import type { Subreddit } from './Subreddit.js';
import type { User } from './User.js';

export type SendPrivateMessageOptions = {
  /** Recipient username (without the leading u/), or /r/name for that subreddit's moderators. */
  to: string;
  /** The subject of the message. */
  subject: string;
  /** The body of the message in markdown text format. */
  text: string;
};

export type SendPrivateMessageAsSubredditOptions = SendPrivateMessageOptions & {
  /** The name of the subreddit the message is being sent from (without the leading r/) */
  fromSubredditName: string;
};

export type GetPrivateMessagesOptions = Prettify<
  {
    type?: 'inbox' | 'unread' | 'sent';
  } & ListingFetchOptions
>;

type PrivateMessageAuthor =
  | (Pick<User, 'username'> & { type: 'user'; id?: T2ID })
  | (Pick<Subreddit, 'name'> & { type: 'subreddit'; id?: T5ID });

export class PrivateMessage {
  readonly #id: TID;
  readonly #from: PrivateMessageAuthor;
  readonly #body: string;
  readonly #bodyHtml: string;
  readonly #created: Date;

  readonly #metadata: Metadata | undefined;

  /** @internal */
  static async getMessages(
    options: GetPrivateMessagesOptions,
    metadata: Metadata | undefined
  ): Promise<Listing<PrivateMessage>> {
    const client = Devvit.redditAPIPlugins.PrivateMessages;
    return new Listing({
      ...options,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const listing = await client.MessageWhere(
          {
            ...fetchOpts,
            where: options.type ?? 'inbox',
          },
          metadata
        );
        return {
          after: listing.data?.after,
          before: listing.data?.before,
          children: (listing.data?.children
            ?.map((child) => {
              return new PrivateMessage(child.data!, metadata);
            })
            .filter(Boolean) || []) as PrivateMessage[],
        };
      },
    });
  }

  /** @internal */
  static async send(
    { to, subject, text }: SendPrivateMessageOptions,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.PrivateMessages;

    await client.Compose(
      {
        to,
        subject,
        text,
        fromSr: '',
      },
      metadata
    );
  }

  /** @internal */
  static async sendAsSubreddit(
    { to, fromSubredditName, subject, text }: SendPrivateMessageAsSubredditOptions,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.PrivateMessages;

    await client.Compose(
      {
        to,
        fromSr: fromSubredditName,
        subject,
        text,
      },
      metadata
    );
  }

  /** @internal */
  static async markAllAsRead(metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.PrivateMessages;
    await client.ReadAllMessages({ filterTypes: '' }, metadata);
  }

  /**
   * @internal
   */
  constructor(data: RedditObject, metadata: Metadata | undefined) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'PrivateMessage: Invalid data, no id');
    assertNonNull(data.name, 'PrivateMessage: Invalid data, no name');
    assertNonNull(data.created, 'PrivateMessage: Invalid data, no created date');

    this.#id = asTID(data.name);

    if (data.author != null) {
      this.#from = {
        type: 'user',
        username: data.author,
        id: data.authorFullname ? asT2ID(data.authorFullname) : undefined,
      };
    } else if (data.subreddit != null) {
      this.#from = {
        type: 'subreddit',
        name: data.subreddit,
        id: data.subredditId ? asT5ID(data.subredditId) : undefined,
      };
    } else {
      throw new Error('PrivateMessage: Invalid data, no author or subreddit');
    }

    this.#body = data.body ?? '';
    this.#bodyHtml = data.bodyHtml ?? '';

    const created = new Date(0);
    created.setUTCSeconds(data.createdUtc!);
    this.#created = created;

    this.#metadata = metadata;
  }

  get id(): TID {
    return this.#id;
  }

  get from(): PrivateMessageAuthor {
    return this.#from;
  }

  get body(): string {
    return this.#body;
  }

  get bodyHtml(): string {
    return this.#bodyHtml;
  }

  get created(): Date {
    return this.#created;
  }

  async markAsRead(): Promise<void> {
    const client = Devvit.redditAPIPlugins.PrivateMessages;
    await client.ReadMessage({ id: this.#id }, this.#metadata);
  }
}
