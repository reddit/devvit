import type {
  Metadata,
  WikiPage as WikiPageProto,
  WikiPageRevision as WikiPageRevisionProto,
  WikiPageRevisionListing,
  WikiPageSettings_Data,
} from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { Devvit } from '../../../devvit/Devvit.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { Listing } from './Listing.js';
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
  reason?: string;
};

export type GetPageRevisionsOptions = {
  /** The name of the subreddit the page is in. */
  subredditName: string;
  /** The name of the page to get revisions for. */
  page?: string;
  /** The number of revisions to get per request. */
  pageSize?: number;
  /** The maximum number of revisions to get. */
  limit?: number;
  /** The ID of the revision to start at. */
  after?: string;
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

export class WikiPage {
  #name: string;
  #subredditName: string;
  #content: string;
  #contentHtml: string;
  #revisionId: string;
  #revisionDate: Date;
  #revisionReason: string;
  #revisionAuthor: User | undefined;

  #metadata: Metadata | undefined;

  /**
   * @internal
   */
  constructor(
    name: string,
    subredditName: string,
    data: WikiPageProto,
    metadata: Metadata | undefined
  ) {
    makeGettersEnumerable(this);

    this.#name = name;
    this.#subredditName = subredditName;
    this.#content = data.contentMd;
    this.#contentHtml = data.contentHtml;
    this.#revisionId = data.revisionId;
    this.#revisionDate = new Date(data.revisionDate * 1000); // data.revisionDate is represented in seconds, so multiply by 1000 to get milliseconds
    this.#revisionReason = data.reason ?? '';
    this.#revisionAuthor = data.revisionBy?.data
      ? new User(data.revisionBy.data, metadata)
      : undefined;

    this.#metadata = metadata;
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
  get revisionId(): string {
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
    return WikiPage.updatePage(
      {
        subredditName: this.#subredditName,
        page: this.#name,
        content,
        reason,
      },
      this.#metadata
    );
  }

  /** Get the revisions for this page. */
  async getRevisions(
    options: Omit<GetPageRevisionsOptions, 'subredditName' | 'page'>
  ): Promise<Listing<WikiPageRevision>> {
    return WikiPage.getPageRevisions(
      {
        subredditName: this.#subredditName,
        page: this.#name,
        ...options,
      },
      this.#metadata
    );
  }

  /** Revert this page to a previous revision. */
  async revertTo(revisionId: string): Promise<void> {
    return WikiPage.revertPage(this.#subredditName, this.#name, revisionId, this.#metadata);
  }

  /** Get the settings for this page. */
  async getSettings(): Promise<WikiPageSettings> {
    return WikiPage.getPageSettings(this.#subredditName, this.#name, this.#metadata);
  }

  /** Update the settings for this page. */
  async updateSettings(
    options: Omit<UpdatePageSettingsOptions, 'subredditName' | 'page'>
  ): Promise<WikiPageSettings> {
    return WikiPage.updatePageSettings(
      {
        subredditName: this.#subredditName,
        page: this.#name,
        listed: options.listed,
        permLevel: options.permLevel,
      },
      this.#metadata
    );
  }

  /** Add an editor to this page. */
  async addEditor(username: string): Promise<void> {
    return WikiPage.addEditor(this.#subredditName, this.#name, username, this.#metadata);
  }

  /** Remove an editor from this page. */
  async removeEditor(username: string): Promise<void> {
    return WikiPage.removeEditor(this.#subredditName, this.#name, username, this.#metadata);
  }

  /** @internal */
  static async getPage(
    subredditName: string,
    page: string,
    metadata: Metadata | undefined
  ): Promise<WikiPage> {
    const client = Devvit.redditAPIPlugins.Wiki;
    const response = await client.GetWikiPage(
      {
        subreddit: subredditName,
        page,
      },
      metadata
    );

    assertNonNull(response.data, 'Failed to get wiki page');

    return new WikiPage(page, subredditName, response.data, metadata);
  }

  /** @internal */
  static async getPages(subredditName: string, metadata: Metadata | undefined): Promise<string[]> {
    const client = Devvit.redditAPIPlugins.Wiki;
    const response = await client.GetWikiPages({ subreddit: subredditName }, metadata);

    return response.data || [];
  }

  /** @internal */
  static async createPage(
    options: CreateWikiPageOptions,
    metadata: Metadata | undefined
  ): Promise<WikiPage> {
    return WikiPage.updatePage(options, metadata);
  }

  /** @internal */
  static async updatePage(
    options: UpdateWikiPageOptions,
    metadata: Metadata | undefined
  ): Promise<WikiPage> {
    const client = Devvit.redditAPIPlugins.Wiki;
    await client.EditWikiPage(
      {
        subreddit: options.subredditName,
        page: options.page,
        content: options.content,
        reason: options.reason ?? '',
      },
      metadata
    );

    return WikiPage.getPage(options.subredditName, options.page, metadata);
  }

  /** @internal */
  static getPageRevisions(
    options: GetPageRevisionsOptions,
    metadata: Metadata | undefined
  ): Listing<WikiPageRevision> {
    const client = Devvit.redditAPIPlugins.Wiki;
    return new Listing({
      hasMore: true,
      after: options.after,
      limit: options.limit,
      pageSize: options.pageSize,
      async fetch(fetchOptions) {
        const response = await client.GetWikiPageRevisions(
          {
            subreddit: options.subredditName,
            page: options.page ?? '',
            limit: fetchOptions.limit,
            after: fetchOptions.after,
            before: fetchOptions.before,
          },
          metadata
        );

        return wikiPageRevisionListingProtoToWikiPageRevision(response, metadata);
      },
    });
  }

  /** @internal */
  static async revertPage(
    subredditName: string,
    page: string,
    revisionId: string,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Wiki;

    await client.RevertWikiPage(
      {
        subreddit: subredditName,
        page,
        revision: revisionId,
      },
      metadata
    );
  }

  /** @internal */
  static async getPageSettings(
    subredditName: string,
    page: string,
    metadata: Metadata | undefined
  ): Promise<WikiPageSettings> {
    const client = Devvit.redditAPIPlugins.Wiki;
    const response = await client.GetWikiPageSettings(
      {
        subreddit: subredditName,
        page,
      },
      metadata
    );

    assertNonNull(response.data, 'Failed to get wiki page settings');

    return new WikiPageSettings(response.data, metadata);
  }

  /** @internal */
  static async updatePageSettings(
    options: UpdatePageSettingsOptions,
    metadata: Metadata | undefined
  ): Promise<WikiPageSettings> {
    const client = Devvit.redditAPIPlugins.Wiki;
    const response = await client.UpdateWikiPageSettings(
      {
        subreddit: options.subredditName,
        page: options.page,
        listed: options.listed ? 'on' : '',
        permlevel: options.permLevel,
      },
      metadata
    );

    assertNonNull(response.data, 'Failed to update wiki page settings');

    return new WikiPageSettings(response.data, metadata);
  }

  /** @internal */
  static async addEditor(
    subredditName: string,
    page: string,
    username: string,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Wiki;
    await client.AllowEditor(
      {
        act: 'add',
        subreddit: subredditName,
        page,
        username,
      },
      metadata
    );
  }

  /** @internal */
  static async removeEditor(
    subredditName: string,
    page: string,
    username: string,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Wiki;
    await client.AllowEditor(
      {
        act: 'del',
        subreddit: subredditName,
        page,
        username,
      },
      metadata
    );
  }
}

export class WikiPageRevision {
  #id: string;
  #page: string;
  #date: Date;
  #author: User;
  #reason: string;
  #hidden: boolean;

  constructor(data: WikiPageRevisionProto, metadata: Metadata | undefined) {
    this.#id = data.id;
    this.#page = data.page;
    this.#date = new Date(data.timestamp);

    assertNonNull(data.author?.data, 'Wiki page revision author details are missing');
    this.#author = new User(data.author.data, metadata);

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

  constructor(data: WikiPageSettings_Data, metadata: Metadata | undefined) {
    this.#listed = data.listed;
    this.#permLevel = data.permLevel;
    this.#editors = data.editors.map((editor) => {
      assertNonNull(editor.data, 'Wiki page editor details are missing');
      return new User(editor.data, metadata);
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

function wikiPageRevisionListingProtoToWikiPageRevision(
  listingProto: WikiPageRevisionListing,
  metadata: Metadata | undefined
): { children: WikiPageRevision[]; before: string | undefined; after: string | undefined } {
  assertNonNull(listingProto.data?.children, 'Wiki page revision listing is missing children');

  const children = listingProto.data.children.map((child) => {
    return new WikiPageRevision(child, metadata);
  });

  return {
    children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}
