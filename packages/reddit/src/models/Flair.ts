import {
  type RedditObject_AuthorFlairRichText,
  type RedditObject_LinkFlairRichText,
  type FlairCsvResult,
  type FlairObject,
  type Metadata,
  type UserFlair as UserFlairProto,
} from '@devvit/protos';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { T3 } from '@devvit/shared-types/tid.js';

import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { getRedditApiPlugins } from '../plugin.js';

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

  /**
   * @internal
   */
  constructor(data: FlairObject, subredditName: string) {
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
    return FlairTemplate.deleteFlairTemplate(this.#id, this.#subredditName);
  }

  /** Edit this flair template */
  async edit(
    options: Partial<Omit<EditFlairTemplateOptions, 'id' | 'subredditName'>>
  ): Promise<FlairTemplate> {
    return FlairTemplate.editFlairTemplate({
      id: this.#id,
      subredditName: this.#subredditName,
      text: options.text ?? this.#text,
      allowableContent: options.allowableContent ?? this.#allowableContent,
      backgroundColor: options.backgroundColor ?? this.#backgroundColor,
      maxEmojis: options.maxEmojis ?? this.#maxEmojis,
      modOnly: options.modOnly ?? this.#modOnly,
      textColor: options.textColor ?? this.#textColor,
      allowUserEdits: options.allowUserEdits ?? this.#allowUserEdits,
    });
  }

  /** @internal */
  static async createPostFlairTemplate(
    options: CreateFlairTemplateOptions
  ): Promise<FlairTemplate> {
    return FlairTemplate.#createOrUpdateFlairTemplate({ ...options, flairType: FlairType.Post });
  }

  /** @internal */
  static async createUserFlairTemplate(
    options: CreateFlairTemplateOptions
  ): Promise<FlairTemplate> {
    return FlairTemplate.#createOrUpdateFlairTemplate({ ...options, flairType: FlairType.User });
  }

  /** @internal */
  static async editFlairTemplate(editOptions: EditFlairTemplateOptions): Promise<FlairTemplate> {
    return FlairTemplate.#createOrUpdateFlairTemplate(editOptions);
  }

  /** @internal */
  static async #createOrUpdateFlairTemplate(
    options: CreateFlairTemplateOptions & { flairType?: FlairType; id?: string }
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

    const client = getRedditApiPlugins().Flair;

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
      this.#metadata
    );

    return new FlairTemplate(response, subreddit);
  }

  /** @internal */
  static async getPostFlairTemplates(subredditName: string): Promise<FlairTemplate[]> {
    const client = getRedditApiPlugins().Flair;

    const response = await client.LinkFlair(
      {
        subreddit: subredditName,
      },
      this.#metadata
    );

    return response.flair?.map((flair) => new FlairTemplate(flair, subredditName)) || [];
  }

  /** @internal */
  static async getUserFlairTemplates(subredditName: string): Promise<FlairTemplate[]> {
    const client = getRedditApiPlugins().Flair;

    const response = await client.UserFlair(
      {
        subreddit: subredditName,
      },
      this.#metadata
    );

    return response.flair?.map((flair) => new FlairTemplate(flair, subredditName)) || [];
  }

  /** @internal */
  static async deleteFlairTemplate(subredditName: string, flairTemplateId: string): Promise<void> {
    const client = getRedditApiPlugins().Flair;

    await client.DeleteFlairTemplate(
      {
        subreddit: subredditName,
        flairTemplateId,
      },
      this.#metadata
    );
  }

  static get #metadata(): Metadata {
    return context.metadata;
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
  postId: T3;
};

export type InternalSetPostFlairOptions = SetFlairOptions & {
  postId: T3;
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
  flairCssClass?: string | undefined;
  /** The username of the user to which this flair is assigned.*/
  user?: string | undefined;
  /** The text displayed in the UI for this flair. */
  flairText?: string | undefined;
};

export type GetUserFlairBySubredditResponse = {
  /** The list of user flair */
  users: UserFlair[];
  /** The user id of the last user flair in this slice. Its presence indicates
   * that there are more items that can be fetched. Pass this into the "after" parameter
   * in the next call to get the next slice of data  */
  next?: string | undefined;
  /** The user id of the first user flair in this slice. Its presence indicates
   * that there are items before this item that can be fetched. Pass this into the "before" parameter
   * in the next call to get the previous slice of data  */
  prev?: string | undefined;
};

/** This type is used for both the link and author flairs on Post and Comment objects. */
export type CommonFlair = {
  /**
   * One of: "text", "richtext"
   */
  type?: string | undefined;
  /**
   * Flair template ID to use when rendering this flair
   */
  templateId?: string | undefined;
  /**
   * Plain text representation of the flair
   */
  text?: string | undefined;
  /**
   * RichText object representation of the flair
   */
  richtext: {
    /**
     * Enum of element types.  e.g. emoji or text
     */
    elementType?: string | undefined;
    /**
     * Text to show up in the flair, e.g. "Need Advice"
     */
    text?: string | undefined;
    /**
     * Emoji references, e.g. ":rainbow:"
     */
    emojiRef?: string | undefined;
    /**
     * url string, e.g. "https://reddit.com/"
     */
    url?: string | undefined;
  }[];
  /**
   * Custom CSS classes from the subreddit's stylesheet to apply to the flair if rendered as HTML
   */
  cssClass?: string | undefined;
  /**
   * One of: "light", "dark"
   */
  textColor?: string | undefined;
  /**
   * Flair background color as a hex color string (# prefixed)
   * @example "#FF4500"
   */
  backgroundColor?: string | undefined;
};

/** @internal */
export type ProtosFlairData = {
  flairBackgroundColor?: string | undefined;
  flairCssClass?: string | undefined;
  flairText?: string | undefined;
  flairType?: string | undefined;
  flairTemplateId?: string | undefined;
  flairRichtext?: RedditObject_LinkFlairRichText[] | RedditObject_AuthorFlairRichText[] | undefined;
  flairTextColor?: string | undefined;
}

/** @internal */
export function convertProtosFlairToCommonFlair(data: ProtosFlairData): CommonFlair | undefined {
  if (
    data.flairBackgroundColor ||
    data.flairCssClass ||
    data.flairText ||
    data.flairType ||
    data.flairTemplateId ||
    data.flairRichtext ||
    data.flairTextColor
  ) {
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
    options: GetUserFlairBySubredditOptions
  ): Promise<GetUserFlairBySubredditResponse> {
    const client = getRedditApiPlugins().Flair;
    return client.FlairList(options, this.#metadata);
  }

  /** @internal */
  static setUserFlair(options: SetUserFlairOptions): Promise<void> {
    return Flair.#setFlair(options);
  }

  /** @internal */
  static setUserFlairBatch(
    subredditName: string,
    flairs: SetUserFlairBatchConfig[]
  ): Promise<FlairCsvResult[]> {
    return Flair.#setUserFlairBatch(subredditName, flairs);
  }

  /** @internal */
  static setPostFlair(options: SetPostFlairOptions): Promise<void> {
    return Flair.#setFlair({
      ...options,
      postId: T3(options.postId),
    });
  }

  /** @internal */
  static async #setFlair(
    options: (Omit<SetPostFlairOptions, 'postId'> & { postId: T3 }) | SetUserFlairOptions
  ): Promise<void> {
    const client = getRedditApiPlugins().Flair;

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
      this.#metadata
    );
  }

  /** @internal */
  static async #setUserFlairBatch(
    subredditName: string,
    flairs: SetUserFlairBatchConfig[]
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

    const client = getRedditApiPlugins().Flair;
    const response = await client.FlairCsv(
      {
        subreddit: subredditName,
        flairCsv,
      },
      this.#metadata
    );

    return response.result;
  }

  /** @internal */
  static async removePostFlair(subredditName: string, postId: T3): Promise<void> {
    return Flair.#removeFlair(subredditName, postId, undefined);
  }

  /** @internal */
  static async removeUserFlair(subredditName: string, username: string): Promise<void> {
    return Flair.#removeFlair(subredditName, undefined, username);
  }

  static async #removeFlair(
    subredditName: string,
    postId: string | undefined,
    username: string | undefined
  ): Promise<void> {
    const client = getRedditApiPlugins().Flair;

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
      this.#metadata
    );
  }

  static get #metadata(): Metadata {
    return context.metadata;
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
