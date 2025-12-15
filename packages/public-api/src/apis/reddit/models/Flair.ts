import {
  type FlairCsvResult,
  type FlairObject,
  type Metadata,
  type RedditObject_AuthorFlairRichText,
  type RedditObject_LinkFlairRichText,
  type UserFlair as UserFlairProto,
} from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { Devvit } from '../../../devvit/Devvit.js';
import type { T3ID } from '../../../types/tid.js';
import { asT3ID } from '../../../types/tid.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';

export enum FlairType {
  User = 'USER_FLAIR',
  Post = 'LINK_FLAIR',
}

export type AllowableFlairContent = 'all' | 'emoji' | 'text';
export type FlairTextColor = 'light' | 'dark';
export type FlairBackgroundColor = `#${string}` | 'transparent';

export type CreateFlairTemplateOptions = {
  /** The name of the subreddit to create the flair template in. */
  subredditName: string;
  /** The flair template's allowable content. Either 'all', 'emoji', or 'text'. */
  allowableContent?: AllowableFlairContent;
  /** The background color of the flair. Either 'transparent' or a hex color code. e.g. #FFC0CB */
  backgroundColor?: string;
  maxEmojis?: number;
  /** Whether or not this flair template is only available to moderators. */
  modOnly?: boolean;
  /** The text to display in the flair. */
  text: string;
  /** Either 'dark' or 'light'. */
  textColor?: FlairTextColor;
  /** Whether or not users are allowed to edit this flair template before using it. */
  allowUserEdits?: boolean;
};

export type EditFlairTemplateOptions = CreateFlairTemplateOptions & {
  id: string;
};

export class FlairTemplate {
  #id: string;
  #subredditName: string;
  #text: string;
  #textColor: FlairTextColor;
  #backgroundColor: FlairBackgroundColor;
  #allowableContent: AllowableFlairContent;
  #modOnly: boolean;
  #maxEmojis: number;
  #allowUserEdits: boolean;

  #metadata: Metadata | undefined;

  /**
   * @internal
   */
  constructor(data: FlairObject, subredditName: string, metadata: Metadata | undefined) {
    makeGettersEnumerable(this);

    assertNonNull(data.id);
    assertNonNull(data.text);

    this.#id = data.id;
    this.#subredditName = subredditName;
    this.#text = data.text;
    this.#textColor = asFlairTextColor(data.textColor);
    this.#backgroundColor = asFlairBackgroundColor(data.backgroundColor);
    this.#allowableContent = asAllowableContent(data.allowableContent);
    this.#modOnly = data.modOnly;
    this.#maxEmojis = data.maxEmojis;
    this.#allowUserEdits = data.textEditable;

    this.#metadata = metadata;
  }

  /** The flair template's ID */
  get id(): string {
    return this.#id;
  }

  /** The flair template's text */
  get text(): string {
    return this.#text;
  }

  /** The flair template's text color. Either 'dark' or 'light'. */
  get textColor(): FlairTextColor {
    return this.#textColor;
  }

  /** The flair template's background color. Either 'transparent' or a hex color code. e.g. #FFC0CB */
  get backgroundColor(): FlairBackgroundColor {
    return this.#backgroundColor;
  }

  /** The flair template's allowable content. Either 'all', 'emoji', or 'text'. */
  get allowableContent(): AllowableFlairContent {
    return this.#allowableContent;
  }

  /** Is the flair template only available to moderators? */
  get modOnly(): boolean {
    return this.#modOnly;
  }

  /** The flair template's maximum number of emojis. */
  get maxEmojis(): number {
    return this.#maxEmojis;
  }

  /** Does the flair template allow users to edit their flair? */
  get allowUserEdits(): boolean {
    return this.#allowUserEdits;
  }

  /** Delete this flair template */
  async delete(): Promise<void> {
    return FlairTemplate.deleteFlairTemplate(this.#id, this.#subredditName, this.#metadata);
  }

  /** Edit this flair template */
  async edit(
    options: Partial<Omit<EditFlairTemplateOptions, 'id' | 'subredditName'>>
  ): Promise<FlairTemplate> {
    return FlairTemplate.editFlairTemplate(
      {
        id: this.#id,
        subredditName: this.#subredditName,
        text: options.text ?? this.#text,
        allowableContent: options.allowableContent ?? this.#allowableContent,
        backgroundColor: options.backgroundColor ?? this.#backgroundColor,
        maxEmojis: options.maxEmojis ?? this.#maxEmojis,
        modOnly: options.modOnly ?? this.#modOnly,
        textColor: options.textColor ?? this.#textColor,
        allowUserEdits: options.allowUserEdits ?? this.#allowUserEdits,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async createPostFlairTemplate(
    options: CreateFlairTemplateOptions,
    metadata: Metadata | undefined
  ): Promise<FlairTemplate> {
    return FlairTemplate.#createOrUpdateFlairTemplate(
      { ...options, flairType: FlairType.Post },
      metadata
    );
  }

  /** @internal */
  static async createUserFlairTemplate(
    options: CreateFlairTemplateOptions,
    metadata: Metadata | undefined
  ): Promise<FlairTemplate> {
    return FlairTemplate.#createOrUpdateFlairTemplate(
      { ...options, flairType: FlairType.User },
      metadata
    );
  }

  /** @internal */
  static async editFlairTemplate(
    editOptions: EditFlairTemplateOptions,
    metadata: Metadata | undefined
  ): Promise<FlairTemplate> {
    return FlairTemplate.#createOrUpdateFlairTemplate(editOptions, metadata);
  }

  /** @internal */
  static async #createOrUpdateFlairTemplate(
    options: CreateFlairTemplateOptions & { flairType?: FlairType; id?: string },
    metadata: Metadata | undefined
  ): Promise<FlairTemplate> {
    const {
      subredditName: subreddit,
      allowableContent = 'all',
      backgroundColor = 'transparent',
      flairType = '',
      maxEmojis = 10,
      modOnly = false,
      text,
      textColor = 'dark',
      allowUserEdits: textEditable = false,
      id: flairTemplateId = '',
    } = options;

    if (modOnly && textEditable) {
      throw new Error('Cannot have a mod only flair that is editable by users');
    }

    const client = Devvit.redditAPIPlugins.Flair;

    const response = await client.FlairTemplate(
      {
        subreddit,
        allowableContent,
        backgroundColor,
        flairType,
        maxEmojis,
        modOnly,
        text,
        textColor,
        textEditable,
        flairTemplateId,
        cssClass: '',
        overrideCss: false,
      },
      metadata
    );

    return new FlairTemplate(response, subreddit, metadata);
  }

  /** @internal */
  static async getPostFlairTemplates(
    subredditName: string,
    metadata: Metadata | undefined
  ): Promise<FlairTemplate[]> {
    const client = Devvit.redditAPIPlugins.Flair;

    const response = await client.LinkFlair(
      {
        subreddit: subredditName,
      },
      metadata
    );

    return response.flair?.map((flair) => new FlairTemplate(flair, subredditName, metadata)) || [];
  }

  /** @internal */
  static async getUserFlairTemplates(
    subredditName: string,
    metadata: Metadata | undefined
  ): Promise<FlairTemplate[]> {
    const client = Devvit.redditAPIPlugins.Flair;

    const response = await client.UserFlair(
      {
        subreddit: subredditName,
      },
      metadata
    );

    return response.flair?.map((flair) => new FlairTemplate(flair, subredditName, metadata)) || [];
  }

  /** @internal */
  static async deleteFlairTemplate(
    subredditName: string,
    flairTemplateId: string,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Flair;

    await client.DeleteFlairTemplate(
      {
        subreddit: subredditName,
        flairTemplateId,
      },
      metadata
    );
  }
}

export type SetFlairOptions = {
  /** The name of the subreddit of the item to set the flair on */
  subredditName: string;
  /** The flair template's ID */
  flairTemplateId?: string;
  /** The flair text */
  text?: string;
  /** The flair CSS class */
  cssClass?: string;
  /** The flair text color. Either 'dark' or 'light'. */
  textColor?: FlairTextColor;
  /** The flair background color. Either 'transparent' or a hex color code. e.g. #FFC0CB */
  backgroundColor?: string;
};

export type SetUserFlairOptions = SetFlairOptions & {
  /** The username of the user to set the flair on */
  username: string;
};

export type SetPostFlairOptions = SetFlairOptions & {
  /** The ID of the post to set the flair on */
  postId: string;
};

export type InternalSetPostFlairOptions = SetFlairOptions & {
  postId: T3ID;
};

export type SetUserFlairBatchConfig = {
  /** The username of the user to edit the flair on */
  username: string;
  /** The flair text. Can't contain the comma character (",") */
  text?: string | undefined;
  /** The flair CSS class */
  cssClass?: string | undefined;
};

export type UserFlairPageOptions = {
  /** A user id optionally provided which will result in a slice of user flairs, starting after this user, to be returned.  */
  after?: string;
  /** A user id optionally provided which will result in a slice of user flairs, starting before this user, to be returned.  */
  before?: string;
  /** A limit to the number of flairs that will be returned. Default: 25, Max: 1000  */
  limit?: number;
};

export type GetUserFlairBySubredditOptions = UserFlairPageOptions & {
  /** The subreddit associated with the flair being retrieved. */
  subreddit: string;
  /** The username associated with the flair being retrieved. */
  name?: string;
};

export type UserFlair = {
  /** The CSS class applied to this flair in the UI. */
  flairCssClass?: string;
  /** The username of the user to which this flair is assigned.*/
  user?: string;
  /** The text displayed in the UI for this flair. */
  flairText?: string;
};

export type GetUserFlairBySubredditResponse = {
  /** The list of user flair */
  users: UserFlair[];
  /** The user id of the last user flair in this slice. Its presence indicates
   * that there are more items that can be fetched. Pass this into the "after" parameter
   * in the next call to get the next slice of data  */
  next?: string;
  /** The user id of the first user flair in this slice. Its presence indicates
   * that there are items before this item that can be fetched. Pass this into the "before" parameter
   * in the next call to get the previous slice of data  */
  prev?: string;
};

/** This type is used for both the link and author flairs on Post and Comment objects. */
export type CommonFlair = {
  /**
   * One of: "text", "richtext"
   */
  type?: string;
  /**
   * Flair template ID to use when rendering this flair
   */
  templateId?: string;
  /**
   * Plain text representation of the flair
   */
  text?: string;
  /**
   * RichText object representation of the flair
   */
  richtext: {
    /**
     * Enum of element types.  e.g. emoji or text
     */
    elementType?: string;
    /**
     * Text to show up in the flair, e.g. "Need Advice"
     */
    text?: string;
    /**
     * Emoji references, e.g. ":rainbow:"
     */
    emojiRef?: string;
    /**
     * url string, e.g. "https://reddit.com/"
     */
    url?: string;
  }[];
  /**
   * Custom CSS classes from the subreddit's stylesheet to apply to the flair if rendered as HTML
   */
  cssClass?: string;
  /**
   * One of: "light", "dark"
   */
  textColor?: string;
  /**
   * Flair background color as a hex color string (# prefixed) or transparent
   * @example "#FF4500"
   */
  backgroundColor?: string;
};

/** @internal */
export type ProtosFlairData = {
  flairBackgroundColor?: string;
  flairCssClass?: string;
  flairText?: string;
  flairType?: string;
  flairTemplateId?: string;
  flairRichtext?: RedditObject_LinkFlairRichText[] | RedditObject_AuthorFlairRichText[];
  flairTextColor?: string;
};

/** @internal */
export function convertProtosFlairToCommonFlair(data: ProtosFlairData): CommonFlair | undefined {
  // Only one of these four has to be defined and non-empty for a valid flair to be set.
  if (data.flairText || data.flairCssClass || data.flairTemplateId || data.flairRichtext?.length) {
    return {
      backgroundColor: data.flairBackgroundColor,
      cssClass: data.flairCssClass,
      text: data.flairText,
      type: data.flairType,
      templateId: data.flairTemplateId,
      // Map flairRichtext[] into the objects with more user-friendly property names
      richtext: (data.flairRichtext ?? []).map(({ e, t, a, u }) => ({
        elementType: e,
        text: t,
        emojiRef: a,
        url: u,
      })),
      textColor: data.flairTextColor,
    };
  }
}

/** @internal */
export function convertUserFlairProtoToAPI(userFlair: UserFlairProto): UserFlair {
  return {
    flairCssClass: userFlair.flairCssClass,
    user: userFlair.user,
    flairText: userFlair.flairText,
  };
}

export class Flair {
  /**
   * Exposes the ListFlair API. This method will return the list of user flair for the subreddit. If name
   * is specified then it will return the user flair for the given user.
   *
   * @param { GetUserFlairBySubredditOptions } options See the interface
   * @param { Metadata | undefined } metadata See the interface
   *
   * @returns { Promise<GetUserFlairBySubredditResponse> }
   *
   * @example
   * ```ts
   * const response = await reddit.flair.getUserFlairBySubreddit({
   *      subreddit: "EyeBleach",
   *      name: "badapple"
   *   },
   *   metadata
   * );
   * ```
   * @internal
   */
  static async getUserFlairBySubreddit(
    options: GetUserFlairBySubredditOptions,
    metadata: Metadata | undefined
  ): Promise<GetUserFlairBySubredditResponse> {
    const client = Devvit.redditAPIPlugins.Flair;
    return client.FlairList(options, metadata);
  }

  /** @internal */
  static setUserFlair(options: SetUserFlairOptions, metadata: Metadata | undefined): Promise<void> {
    return Flair.#setFlair(options, metadata);
  }

  /** @internal */
  static setUserFlairBatch(
    subredditName: string,
    flairs: SetUserFlairBatchConfig[],
    metadata: Metadata | undefined
  ): Promise<FlairCsvResult[]> {
    return Flair.#setUserFlairBatch(subredditName, flairs, metadata);
  }

  /** @internal */
  static setPostFlair(options: SetPostFlairOptions, metadata: Metadata | undefined): Promise<void> {
    return Flair.#setFlair(
      {
        ...options,
        postId: asT3ID(options.postId),
      },
      metadata
    );
  }

  /** @internal */
  static async #setFlair(
    options: (Omit<SetPostFlairOptions, 'postId'> & { postId: T3ID }) | SetUserFlairOptions,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Flair;

    await client.SelectFlair(
      {
        subreddit: options.subredditName,
        flairTemplateId: options.flairTemplateId ?? '',
        text: options.text ?? '',
        name: (options as SetUserFlairOptions).username ?? '',
        link: (options as InternalSetPostFlairOptions).postId ?? '',
        backgroundColor: options.backgroundColor ?? '',
        textColor: options.textColor ?? 'dark',
        cssClass: options.cssClass ?? '',
        returnRtjson: 'none',
      },
      metadata
    );
  }

  /** @internal */
  static async #setUserFlairBatch(
    subredditName: string,
    flairs: SetUserFlairBatchConfig[],
    metadata: Metadata | undefined
  ): Promise<FlairCsvResult[]> {
    if (!flairs.length) {
      return [];
    }

    const maxFlairsPerRequest = 100;
    if (flairs.length > maxFlairsPerRequest) {
      throw new Error('Unexpected input: flairs array cannot be longer than 100 entries.');
    }

    const csvDelimiter = ',';

    const flairCsv = flairs
      .map((userConfig) => {
        for (const propertyName in userConfig) {
          if (userConfig[propertyName as keyof SetUserFlairBatchConfig]?.includes(csvDelimiter)) {
            throw new Error(`Unexpected input: ${propertyName} cannot contain the "," character`);
          }
        }
        return [userConfig.username, userConfig.text || '', userConfig.cssClass || ''].join(
          csvDelimiter
        );
      })
      .join('\n');

    const client = Devvit.redditAPIPlugins.Flair;
    const response = await client.FlairCsv(
      {
        subreddit: subredditName,
        flairCsv,
      },
      metadata
    );

    return response.result;
  }

  /** @internal */
  static async removePostFlair(
    subredditName: string,
    postId: T3ID,
    metadata: Metadata | undefined
  ): Promise<void> {
    return Flair.#removeFlair(subredditName, postId, undefined, metadata);
  }

  /** @internal */
  static async removeUserFlair(
    subredditName: string,
    username: string,
    metadata: Metadata | undefined
  ): Promise<void> {
    return Flair.#removeFlair(subredditName, undefined, username, metadata);
  }

  static async #removeFlair(
    subredditName: string,
    postId: string | undefined,
    username: string | undefined,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Flair;

    await client.SelectFlair(
      {
        subreddit: subredditName,
        name: username ?? '',
        link: postId ?? '',
        flairTemplateId: '',
        backgroundColor: '',
        text: '',
        textColor: '',
        cssClass: '',
        returnRtjson: 'none',
      },
      metadata
    );
  }
}

function asFlairTextColor(color?: string): FlairTextColor {
  assertNonNull(color, 'Flair text color is required');

  if (color === 'light' || color === 'dark') {
    return color;
  }

  throw new Error(`Invalid flair text color: ${color}`);
}

function asFlairBackgroundColor(color?: string): FlairBackgroundColor {
  if (!color || color.length === 0 || color === 'transparent') {
    return 'transparent';
  }

  if (/^#([A-Fa-f0-9]{6})$/.test(color)) {
    return color as FlairBackgroundColor;
  }

  throw new Error(`Invalid flair background color: ${color}`);
}

function asAllowableContent(allowableContent?: string): AllowableFlairContent {
  if (allowableContent === 'all' || allowableContent === 'text' || allowableContent === 'emoji') {
    return allowableContent;
  }

  throw new Error(`Invalid allowable content: ${allowableContent}`);
}
