import type {
  WikiPage as WikiPageProto,
  WikiPageRevision as WikiPageRevisionProto,
  WikiPageRevisionListing,
  WikiPageSettings_Data,
} from '@devvit/protos/json/devvit/plugin/redditapi/wiki/wiki_msg.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { getRedditApiPlugins } from '../plugin.js';
import { Listing, type ListingFetchOptions } from './Listing.js';
import { User } from './User.js';

export type CreateWikiPageOptions = {
  /** The name of the subreddit to create the page in. */
  subredditName: string;
  /** The name of the page to create. */
  page: string;
  /** The content of the page. */
  content: string;
  /** The reason for creating the page. */
  reason?: string;
};

export type UpdateWikiPageOptions = {
  /** The name of the subreddit the page is in. */
  subredditName: string;
  /** The name of the page to update. */
  page: string;
  /** The new content of the page. */
  content: string;
  /** The reason for updating the page. */
  reason?: string | undefined;
};

export type GetPageRevisionsOptions = Omit<ListingFetchOptions, 'more'> & {
  /** The name of the subreddit the page is in. */
  subredditName: string;
  /** The name of the page to get revisions for. */
  page?: string;
};

export enum WikiPagePermissionLevel {
  /** Use subreddit wiki permissions */
  SUBREDDIT_PERMISSIONS = 0,
  /** Only approved wiki contributors for this page may edit */
  APPROVED_CONTRIBUTORS_ONLY = 1,
  /** Only mods may edit and view */
  MODS_ONLY = 2,
}

export type UpdatePageSettingsOptions = {
  /** The name of the subreddit the page is in. */
  subredditName: string;
  /** The name of the page to update settings for. */
  page: string;
  /** Whether the page should be listed in the wiki index. */
  listed: boolean;
  /** The permission level for the page. */
  permLevel: WikiPagePermissionLevel;
};

/** The revision ID is a v4 UUID */
export type WikiPageRevisionId = `${string}-${string}-${string}-${string}-${string}`;

/**
 * Listing endpoints expect the fullname of an object for the `before` and `after` parameters. Usually
 * this is a `tX_` ID, but the fullname of a wiki page revision is its ID prefixed with `WikiPageRevision_`.
 *
 * Also, when fetching a listing of wiki page revisions, the `after` and `before` values returned
 * by the API are already prefixed. However, the IDs in the revisions themselves are not prefixed.
 */
const WikiPageRevisionPrefix = 'WikiPageRevision_';

export class WikiPage {
  #name: string;
  #subredditName: string;
  #content: string;
  #contentHtml: string;
  #revisionId: WikiPageRevisionId;
  #revisionDate: Date;
  #revisionReason: string;
  #revisionAuthor: User | undefined;

  /**
   * @internal
   */
  constructor(name: string, subredditName: string, data: WikiPageProto) {
    makeGettersEnumerable(this);

    this.#name = name;
    this.#subredditName = subredditName;
    this.#content = data.contentMd;
    this.#contentHtml = data.contentHtml;
    this.#revisionId = data.revisionId as WikiPageRevisionId;
    this.#revisionDate = new Date(data.revisionDate * 1000); // data.revisionDate is represented in seconds, so multiply by 1000 to get milliseconds
    this.#revisionReason = data.reason ?? '';
    this.#revisionAuthor = data.revisionBy?.data ? new User(data.revisionBy.data) : undefined;
  }

  /** The name of the page. */
  get name(): string {
    return this.#name;
  }

  /** The name of the subreddit the page is in. */
  get subredditName(): string {
    return this.#subredditName;
  }

  /** The Markdown content of the page. */
  get content(): string {
    return this.#content;
  }

  /** The HTML content of the page. */
  get contentHtml(): string {
    return this.#contentHtml;
  }

  /** The ID of the revision. */
  get revisionId(): WikiPageRevisionId {
    return this.#revisionId;
  }

  /** The date of the revision. */
  get revisionDate(): Date {
    return this.#revisionDate;
  }

  /** The reason for the revision. */
  get revisionReason(): string {
    return this.#revisionReason;
  }

  /** The author of this revision. */
  get revisionAuthor(): User | undefined {
    return this.#revisionAuthor;
  }

  toJSON(): Pick<
    WikiPage,
    | 'name'
    | 'subredditName'
    | 'content'
    | 'contentHtml'
    | 'revisionId'
    | 'revisionDate'
    | 'revisionReason'
  > & {
    revisionAuthor: ReturnType<User['toJSON']> | undefined;
  } {
    return {
      name: this.#name,
      subredditName: this.#subredditName,
      content: this.#content,
      contentHtml: this.#contentHtml,
      revisionId: this.#revisionId,
      revisionDate: this.#revisionDate,
      revisionReason: this.#revisionReason,
      revisionAuthor: this.#revisionAuthor?.toJSON(),
    };
  }

  /** Update this page. */
  async update(content: string, reason?: string): Promise<WikiPage> {
    return WikiPage.updatePage({
      subredditName: this.#subredditName,
      page: this.#name,
      content,
      reason,
    });
  }

  /** Get the revisions for this page. */
  async getRevisions(
    options: Omit<GetPageRevisionsOptions, 'subredditName' | 'page'>
  ): Promise<Listing<WikiPageRevision>> {
    return WikiPage.getPageRevisions({
      subredditName: this.#subredditName,
      page: this.#name,
      ...options,
    });
  }

  /** Revert this page to a previous revision. */
  async revertTo(revisionId: WikiPageRevisionId): Promise<void> {
    return WikiPage.revertPage(this.#subredditName, this.#name, revisionId);
  }

  /** Get the settings for this page. */
  async getSettings(): Promise<WikiPageSettings> {
    return WikiPage.getPageSettings(this.#subredditName, this.#name);
  }

  /** Update the settings for this page. */
  async updateSettings(
    options: Omit<UpdatePageSettingsOptions, 'subredditName' | 'page'>
  ): Promise<WikiPageSettings> {
    return WikiPage.updatePageSettings({
      subredditName: this.#subredditName,
      page: this.#name,
      listed: options.listed,
      permLevel: options.permLevel,
    });
  }

  /** Add an editor to this page. */
  async addEditor(username: string): Promise<void> {
    return WikiPage.addEditor(this.#subredditName, this.#name, username);
  }

  /** Remove an editor from this page. */
  async removeEditor(username: string): Promise<void> {
    return WikiPage.removeEditor(this.#subredditName, this.#name, username);
  }

  /** @internal */
  static async getPage(
    subredditName: string,
    page: string,
    revisionId: WikiPageRevisionId | undefined
  ): Promise<WikiPage> {
    const client = getRedditApiPlugins().Wiki;
    const response = await client.GetWikiPage(
      {
        subreddit: subredditName,
        page,
        revisionId,
      },
      this.#metadata
    );

    assertNonNull(response.data, 'Failed to get wiki page');

    return new WikiPage(page, subredditName, response.data);
  }

  /** @internal */
  static async getPages(subredditName: string): Promise<string[]> {
    const client = getRedditApiPlugins().Wiki;
    const response = await client.GetWikiPages({ subreddit: subredditName }, this.#metadata);

    return response.data || [];
  }

  /** @internal */
  static async createPage(options: CreateWikiPageOptions): Promise<WikiPage> {
    return WikiPage.updatePage(options);
  }

  /** @internal */
  static async updatePage(options: UpdateWikiPageOptions): Promise<WikiPage> {
    const client = getRedditApiPlugins().Wiki;
    await client.EditWikiPage(
      {
        subreddit: options.subredditName,
        page: options.page,
        content: options.content,
        reason: options.reason ?? '',
      },
      this.#metadata
    );

    return WikiPage.getPage(options.subredditName, options.page, undefined);
  }

  /** @internal */
  static getPageRevisions(options: GetPageRevisionsOptions): Listing<WikiPageRevision> {
    const client = getRedditApiPlugins().Wiki;
    const after = ensureWikiRevisionCursor(options.after);
    const before = ensureWikiRevisionCursor(options.before);

    return new Listing({
      hasMore: true,
      after: after,
      before: before,
      limit: options.limit,
      pageSize: options.pageSize,
      fetch: async (fetchOptions) => {
        const response = await client.GetWikiPageRevisions(
          {
            subreddit: options.subredditName,
            page: options.page ?? '',
            limit: fetchOptions.limit,
            after: fetchOptions.after,
            before: fetchOptions.before,
          },
          this.#metadata
        );

        return wikiPageRevisionListingProtoToWikiPageRevision(response);
      },
    });
  }

  /** @internal */
  static async revertPage(subredditName: string, page: string, revisionId: string): Promise<void> {
    const client = getRedditApiPlugins().Wiki;

    await client.RevertWikiPage(
      {
        subreddit: subredditName,
        page,
        revision: revisionId,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async getPageSettings(subredditName: string, page: string): Promise<WikiPageSettings> {
    const client = getRedditApiPlugins().Wiki;
    const response = await client.GetWikiPageSettings(
      {
        subreddit: subredditName,
        page,
      },
      this.#metadata
    );

    assertNonNull(response.data, 'Failed to get wiki page settings');

    return new WikiPageSettings(response.data);
  }

  /** @internal */
  static async updatePageSettings(options: UpdatePageSettingsOptions): Promise<WikiPageSettings> {
    const client = getRedditApiPlugins().Wiki;
    const response = await client.UpdateWikiPageSettings(
      {
        subreddit: options.subredditName,
        page: options.page,
        listed: options.listed ? 'on' : '',
        permlevel: options.permLevel,
      },
      this.#metadata
    );

    assertNonNull(response.data, 'Failed to update wiki page settings');

    return new WikiPageSettings(response.data);
  }

  /** @internal */
  static async addEditor(subredditName: string, page: string, username: string): Promise<void> {
    const client = getRedditApiPlugins().Wiki;
    await client.AllowEditor(
      {
        act: 'add',
        subreddit: subredditName,
        page,
        username,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async removeEditor(subredditName: string, page: string, username: string): Promise<void> {
    const client = getRedditApiPlugins().Wiki;
    await client.AllowEditor(
      {
        act: 'del',
        subreddit: subredditName,
        page,
        username,
      },
      this.#metadata
    );
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}

export class WikiPageRevision {
  #id: string;
  #page: string;
  #date: Date;
  #author: User;
  #reason: string;
  #hidden: boolean;

  constructor(data: WikiPageRevisionProto) {
    this.#id = data.id;
    this.#page = data.page;
    this.#date = new Date(data.timestamp);

    assertNonNull(data.author?.data, 'Wiki page revision author details are missing');
    this.#author = new User(data.author.data);

    this.#reason = data.reason ?? '';
    this.#hidden = data.revisionHidden ?? false;
  }

  get id(): string {
    return this.#id;
  }

  get page(): string {
    return this.#page;
  }

  get date(): Date {
    return this.#date;
  }

  get author(): User {
    return this.#author;
  }

  get reason(): string {
    return this.#reason;
  }

  get hidden(): boolean {
    return this.#hidden;
  }

  toJSON(): Pick<WikiPageRevision, 'id' | 'page' | 'date' | 'reason' | 'hidden'> & {
    author: ReturnType<User['toJSON']>;
  } {
    return {
      id: this.#id,
      page: this.#page,
      date: this.#date,
      author: this.#author.toJSON(),
      reason: this.#reason,
      hidden: this.#hidden,
    };
  }
}

export class WikiPageSettings {
  #listed: boolean;
  #permLevel: WikiPagePermissionLevel;
  #editors: User[];

  constructor(data: WikiPageSettings_Data) {
    this.#listed = data.listed;
    this.#permLevel = data.permLevel;
    this.#editors = data.editors.map((editor) => {
      assertNonNull(editor.data, 'Wiki page editor details are missing');
      return new User(editor.data);
    });
  }

  get listed(): boolean {
    return this.#listed;
  }

  get permLevel(): WikiPagePermissionLevel {
    return this.#permLevel;
  }

  get editors(): User[] {
    return this.#editors;
  }

  toJSON(): Pick<WikiPageSettings, 'listed' | 'permLevel'> & {
    editors: ReturnType<User['toJSON']>[];
  } {
    return {
      listed: this.#listed,
      permLevel: this.#permLevel,
      editors: this.#editors.map((editor) => editor.toJSON()),
    };
  }
}

function wikiPageRevisionListingProtoToWikiPageRevision(listingProto: WikiPageRevisionListing): {
  children: WikiPageRevision[];
  before: string | undefined;
  after: string | undefined;
} {
  assertNonNull(listingProto.data?.children, 'Wiki page revision listing is missing children');

  const children = listingProto.data.children.map((child) => {
    return new WikiPageRevision(child);
  });

  return {
    children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}

/**
 * When fetching a listing of wiki page revisions, the `after` and `before` values returned
 * by the API are already prefixed. However, the IDs in the revisions themselves are not prefixed.
 *
 * This function ensures that developers can pass either the raw ID (from `WikiPageRevision.id`) or
 * the prefixed ID (from `Listing.after` / `Listing.before`) to listing methods.
 */
function ensureWikiRevisionCursor(token: string | undefined): string | undefined {
  if (!token) return undefined;
  return token.startsWith(WikiPageRevisionPrefix) ? token : `${WikiPageRevisionPrefix}${token}`;
}
