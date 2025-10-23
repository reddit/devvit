import type { Metadata, RedditObject } from '@devvit/protos';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';
import { asTid, T2, T5, type Tid } from '@devvit/shared-types/tid.js';

import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { getRedditApiPlugins } from '../plugin.js';
import type { ListingFetchOptions } from './Listing.js';
import { Listing } from './Listing.js';
import type { Subreddit } from './Subreddit.js';
import type { User } from './User.js';

export type SendPrivateMessageOptions = {
  /** Recipient username (without the leading u/), or /r/name for that subreddit's moderators. */
  to: string;
  /** The subject of the message. */
  subject: string;
  /** The body of the message in Markdown text format. */
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
  | (Pick<User, 'username'> & { type: 'user'; id?: T2 | undefined })
  | (Pick<Subreddit, 'name'> & { type: 'subreddit'; id?: T5 | undefined });

export class PrivateMessage {
  readonly #id: Tid;
  readonly #from: PrivateMessageAuthor;
  readonly #body: string;
  readonly #bodyHtml: string;
  readonly #created: Date;

  /** @internal */
  static async getMessages(options: GetPrivateMessagesOptions): Promise<Listing<PrivateMessage>> {
    const client = getRedditApiPlugins().PrivateMessages;
    return new Listing({
      ...options,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const listing = await client.MessageWhere(
          {
            ...fetchOpts,
            where: options.type ?? 'inbox',
          },
          this.#metadata
        );
        return {
          after: listing.data?.after,
          before: listing.data?.before,
          children: (listing.data?.children
            ?.map((child) => {
              return new PrivateMessage(child.data!);
            })
            .filter(Boolean) || []) as PrivateMessage[],
        };
      },
    });
  }

  /** @internal */
  static async send({ to, subject, text }: SendPrivateMessageOptions): Promise<void> {
    const client = getRedditApiPlugins().PrivateMessages;

    await client.Compose(
      {
        to,
        subject,
        text,
        fromSr: '',
      },
      this.#metadata
    );
  }

  /** @internal */
  static async sendAsSubreddit({
    to,
    fromSubredditName,
    subject,
    text,
  }: SendPrivateMessageAsSubredditOptions): Promise<void> {
    const client = getRedditApiPlugins().PrivateMessages;

    await client.Compose(
      {
        to,
        fromSr: fromSubredditName,
        subject,
        text,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async markAllAsRead(): Promise<void> {
    const client = getRedditApiPlugins().PrivateMessages;
    await client.ReadAllMessages({ filterTypes: '' }, this.#metadata);
  }

  /**
   * @internal
   */
  constructor(data: RedditObject) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'PrivateMessage: Invalid data, no id');
    assertNonNull(data.name, 'PrivateMessage: Invalid data, no name');
    assertNonNull(data.created, 'PrivateMessage: Invalid data, no created date');

    this.#id = asTid(data.name);

    if (data.author != null) {
      this.#from = {
        type: 'user',
        username: data.author,
        id: data.authorFullname ? T2(data.authorFullname) : undefined,
      };
    } else if (data.subreddit != null) {
      this.#from = {
        type: 'subreddit',
        name: data.subreddit,
        id: data.subredditId ? T5(data.subredditId) : undefined,
      };
    } else {
      throw new Error('PrivateMessage: Invalid data, no author or subreddit');
    }

    this.#body = data.body ?? '';
    this.#bodyHtml = data.bodyHtml ?? '';

    const created = new Date(0);
    created.setUTCSeconds(data.createdUtc!);
    this.#created = created;
  }

  get id(): Tid {
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
    const client = getRedditApiPlugins().PrivateMessages;
    await client.ReadMessage({ id: this.#id }, context.metadata);
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}
