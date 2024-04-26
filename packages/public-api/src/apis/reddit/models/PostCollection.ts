import type { CollectionRequest, CollectionResponse, Metadata } from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { Devvit } from '../../../devvit/Devvit.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';

/** Determines how the collection items will be displayed in the ui. */
export enum CollectionDisplayLayout {
  /** PostCollection items will be displayed as a gallery. */
  Gallery = 'GALLERY',
  /** PostCollection items will be displayed as a list. */
  Timeline = 'TIMELINE',
}

export type CreateCollectionInput = {
  /** The title of the collection. */
  title?: string;
  /** The t5_ id of the subreddit in which this collection will be created. */
  subredditId?: string;
  /** The description of the collection. */
  description?: string;
  /** One of: TIMELINE | GALLERY. This determines the layout of posts in the collection UI. */
  displayLayout?: CollectionDisplayLayout;
};

function ConvertDisplayLayoutFromProtoToAPI(
  displayLayout: string | undefined
): CollectionDisplayLayout {
  if (displayLayout === 'GALLERY') {
    return CollectionDisplayLayout.Gallery;
  }

  return CollectionDisplayLayout.Timeline;
}

export type SubredditCollectionsInput = {
  /** The t5_ id of the subreddit that contains the collections to be retrieved. */
  subredditId?: string;
};

export class PostCollection {
  #metadata: Metadata | undefined;
  #id: string;
  #subredditId: string;
  #title: string;
  #description: string;
  #authorId: string;
  #authorName: string;
  #permalink: string | undefined;
  #primaryLinkId: string | undefined;
  #linkIds: string[];
  #createdAtUtc: Date;
  #lastUpdateUtc: Date;
  #displayLayout: CollectionDisplayLayout;

  /**
   * @internal
   */
  constructor(data: CollectionResponse, metadata: Metadata | undefined) {
    assertNonNull(data.collectionId, 'Collection Id is missing or undefined');
    assertNonNull(data.subredditId, 'Subreddit Id is missing or undefined');
    assertNonNull(data.title, 'Collection title is missing or undefined');
    assertNonNull(data.authorId, "Collection author's id is missing or undefined");
    assertNonNull(data.authorName, "Collection author's id is missing or undefined");
    assertNonNull(data.createdAtUtc, 'Collection create timestamp is missing');
    assertNonNull(data.lastUpdateUtc, 'Collection last updated timestamp is missing');

    this.#metadata = metadata;
    this.#id = data.collectionId;
    this.#subredditId = data.subredditId;
    this.#title = data.title;
    this.#description = data.description || '';
    this.#authorId = data.authorId;
    this.#authorName = data.authorName;
    this.#permalink = data.permalink;
    this.#primaryLinkId = data.primaryLinkId;
    this.#linkIds = data.linkIds || [];
    this.#displayLayout = ConvertDisplayLayoutFromProtoToAPI(data.displayLayout);
    this.#createdAtUtc = data.createdAtUtc;
    this.#lastUpdateUtc = data.lastUpdateUtc;

    makeGettersEnumerable(this);
  }

  // Getters

  /**
   * The ID of the collection
   */
  get id(): string {
    return this.#id;
  }

  /**
   * The subreddit ID of the subreddit where the collection belongs.
   */
  get subredditId(): string {
    return this.#subredditId;
  }

  /**
   * The title of the collection.
   */
  get title(): string {
    return this.#title;
  }

  /**
   * The description of the collection.
   */
  get description(): string {
    return this.#description;
  }

  /**
   * The user ID of the author of the collection.
   */
  get authorId(): string {
    return this.#authorId;
  }

  /**
   * The username of the author of the collection.
   */
  get authorName(): string {
    return this.#authorName;
  }

  /**
   * The permalink to the collection.
   */
  get permalink(): string | undefined {
    return this.#permalink;
  }

  /**
   * The primaryLinkId in the collection.
   */
  get primaryLinkId(): string | undefined {
    return this.#primaryLinkId;
  }

  /**
   * The post IDs of the posts in the collection.
   */
  get linkIds(): string[] {
    return this.#linkIds;
  }

  /**
   * The timestamp when this collection was created.
   */
  get createdAtUtc(): Date {
    return this.#createdAtUtc;
  }

  /**
   * The timestamp when this collection was last updated.
   */
  get lastUpdateUtc(): Date {
    return this.#lastUpdateUtc;
  }

  /**
   * The layout used to display this collection in the UI.
   */
  get displayLayout(): CollectionDisplayLayout {
    return this.#displayLayout;
  }

  // Static Methods

  /**
   * Fetches a collection given the collection ID.
   *
   * @param options See interface
   * @param metadata See interface
   *
   * @returns A promise that resolves to a collection.
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById({
   *      collection_id: "198febf6-084c-4a21-bdbd-a014e5fd0d4d",
   *   },
   *   metadata
   * );
   * ```
   * @internal
   */
  static async getCollectionById(
    options: CollectionRequest,
    metadata: Metadata | undefined
  ): Promise<PostCollection> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    const response = await client.Collection(options, metadata);
    return new PostCollection(response, metadata);
  }

  /**
   * Creates a new collection for the given subreddit.
   *
   * @param options See interface
   * @param metadata See interface
   *
   * @returns A promise that resolves to a collection.
   *
   * @example
   * ```ts
   *   const collection = await reddit.createCollection({
   *      title: "Cats",
   *      description: "This is a post collection about cats",
   *      subredditId: "t5_asd",
   *      displayLayout: "GALLERY"
   *    })
   * ```
   * @internal
   */
  static async create(
    options: CreateCollectionInput,
    metadata: Metadata | undefined
  ): Promise<PostCollection> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    const response = await client.Create(
      {
        srFullname: options.subredditId,
        title: options.title,
        description: options.description,
        displayLayout: options.displayLayout,
      },
      metadata
    );
    return new PostCollection(response, metadata);
  }

  /**
   * Gets the list of collections that exist in a subreddit.
   *
   * @param options See interface
   * @param metadata See interface
   *
   * @returns A promise that resolves to an array of collections.
   *
   * @example
   * ```ts
   * const collections = await reddit.getCollectionsForSubreddit({
   *    subredditId: "t5_asdf"
   * })
   * ```
   * @internal
   */
  static async getCollectionsForSubreddit(
    options: SubredditCollectionsInput,
    metadata: Metadata | undefined
  ): Promise<PostCollection[]> {
    const response = await Devvit.redditapiv2Plugin.GetSubredditCollections(
      { srFullname: options.subredditId },
      metadata
    );
    return response.collections.map((data) => new PostCollection(data, metadata));
  }

  /**
   * Adds a post to the collection.
   *
   * @param postId The id of the post to add to the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.addPost("t3_asd")
   * ```
   */
  async addPost(postId: string): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.AddPost(
      {
        collectionId: this.#id,
        linkFullname: postId,
      },
      this.#metadata
    );
    this.#linkIds.push(postId);
  }

  /**
   * Remove a post from the collection.
   *
   * @param postId The id of the post to add to the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.removePost("t3_asd")
   * ```
   */
  async removePost(postId: string): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.RemovePost(
      {
        collectionId: this.#id,
        linkFullname: postId,
      },
      this.#metadata
    );
    this.#linkIds = this.#linkIds.filter((id) => id !== postId);
  }

  /**
   * Deletes the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.delete()
   * ```
   */
  async delete(): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.Delete(
      {
        collectionId: this.#id,
      },
      this.#metadata
    );
  }

  /**
   * Follows the collection.
   *
   * @param follow True to follow the collection, false to unfollow the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * // Follow the collection
   * await collection.follow(true)
   * // Unfollow the collection
   * await collection.follow(false)
   * ```
   */
  async follow(follow: boolean): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.Follow(
      {
        collectionId: this.#id,
        follow,
      },
      this.#metadata
    );
  }

  /**
   * Sets the order of the posts in the collection.
   *
   * @param postIds Array of post ids that determins the order of the posts in the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.reorder(["t3_asd", "t3_fgh"])
   * ```
   */
  async reorder(postIds: string[]): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.Reorder(
      {
        collectionId: this.#id,
        linkIds: postIds.join(','),
      },
      this.#metadata
    );
    this.#linkIds = postIds;
  }

  /**
   * Sets the title of the collection.
   *
   * @param title The new title of the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.updateTitle("Dogs")
   * ```
   */
  async updateTitle(title: string): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.UpdateTitle(
      {
        collectionId: this.#id,
        title,
      },
      this.#metadata
    );
    this.#title = title;
  }

  /**
   * Sets the description of the collection.
   *
   * @param description The new description of the collection.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.updateDescription("Posts about dogs")
   * ```
   */
  async updateDescription(description: string): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.UpdateDescription(
      {
        collectionId: this.#id,
        description,
      },
      this.#metadata
    );
    this.#description = description;
  }

  /**
   * Sets the display layout of the collection
   *
   * @param displayLayout One of: TIMELINE | GALLERY. This determines the layout of posts in the collection UI.
   *
   * @returns Void
   *
   * @example
   * ```ts
   * const collection = await reddit.getCollectionById("198febf6-084c-4a21-bdbd-a014e5fd0d4d")
   * await collection.updateLayout("GALLERY")
   * ```
   */
  async updateLayout(displayLayout: CollectionDisplayLayout): Promise<void> {
    const client = Devvit.redditAPIPlugins.PostCollections;
    await client.UpdateDisplayLayout(
      {
        collectionId: this.#id,
        displayLayout,
      },
      this.#metadata
    );
    this.#displayLayout = displayLayout;
  }
}
