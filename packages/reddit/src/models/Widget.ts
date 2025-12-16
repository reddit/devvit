import type { SubredditAboutRulesResponse } from '@devvit/protos/json/devvit/plugin/redditapi/subreddits/subreddits_msg.js';
import type {
  CommunityListWidget_CommunityData as CommunityData,
  GetWidgetsResponse_WidgetItem as WidgetItem,
  GetWidgetsResponse_WidgetItem_PostFlairTemplate as PostFlairTemplateData,
} from '@devvit/protos/json/devvit/plugin/redditapi/widgets/widgets_msg.js';
import type {
  AddButtonWidgetRequest,
  AddCalendarWidgetRequest,
  AddCommunityListWidgetRequest,
  AddCustomWidgetRequest,
  AddImageWidgetRequest,
  AddPostFlairWidgetRequest,
  AddTextAreaWidgetRequest,
  CalendarWidgetConfiguration,
  UpdateButtonWidgetRequest,
  UpdateCalendarWidgetRequest,
  UpdateCommunityListWidgetRequest,
  UpdateCustomWidgetRequest,
  UpdateImageWidgetRequest,
  UpdatePostFlairWidgetRequest,
  UpdateTextAreaWidgetRequest,
  WidgetButton,
  WidgetImage,
  WidgetStyles,
} from '@devvit/protos/json/devvit/plugin/redditapi/widgets/widgets_msg.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { getRedditApiPlugins } from '../plugin.js';

export type AddWidgetData =
  | (AddImageWidgetRequest & {
      type: 'image';
    })
  | (AddCalendarWidgetRequest & {
      type: 'calendar';
    })
  | (AddTextAreaWidgetRequest & {
      type: 'textarea';
    })
  | (AddButtonWidgetRequest & {
      type: 'button';
    })
  | (AddCommunityListWidgetRequest & {
      type: 'community-list';
    })
  | (AddPostFlairWidgetRequest & {
      type: 'post-flair';
    })
  | (AddCustomWidgetRequest & {
      type: 'custom';
    });

export type UpdateWidgetData =
  | (UpdateImageWidgetRequest & {
      type: 'image';
    })
  | (UpdateCalendarWidgetRequest & {
      type: 'calendar';
    })
  | (UpdateTextAreaWidgetRequest & {
      type: 'textarea';
    })
  | (UpdateButtonWidgetRequest & {
      type: 'button';
    })
  | (UpdateCommunityListWidgetRequest & {
      type: 'community-list';
    })
  | (UpdatePostFlairWidgetRequest & {
      type: 'post-flair';
    })
  | (UpdateCustomWidgetRequest & {
      type: 'custom';
    });

function getMetadata(): Metadata {
  return context.metadata;
}

export class Widget {
  #id: string;
  #name: string;
  #subredditName: string;

  constructor(widgetData: WidgetItem, subredditName: string) {
    makeGettersEnumerable(this);

    this.#id = widgetData.id;
    this.#name = widgetData.shortName;
    this.#subredditName = subredditName;
  }

  get id(): string {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get subredditName(): string {
    return this.#subredditName;
  }

  toJSON(): Pick<Widget, 'id' | 'name' | 'subredditName'> {
    return {
      id: this.id,
      name: this.name,
      subredditName: this.subredditName,
    };
  }

  delete(): Promise<void> {
    return Widget.delete(this.subredditName, this.id);
  }

  /**
   * @internal
   * @note - This method only returns the widgets listed on the sidebar.
   */
  static async getWidgets(subredditName: string): Promise<Widget[]> {
    const client = getRedditApiPlugins().Widgets;

    const response = await client.GetWidgets(
      {
        subreddit: subredditName,
      },
      getMetadata()
    );

    assertNonNull(response.layout, 'Failed to load widgets for subreddit');

    const widgetsMap = response.items;

    const widgets: Widget[] = [];

    for (const widgetId of response.layout.sidebar?.order ?? []) {
      const widgetData = widgetsMap[widgetId];
      switch (widgetData?.kind) {
        case 'image':
          widgets.push(new ImageWidget(widgetData, subredditName));
          break;
        case 'calendar':
          widgets.push(new CalendarWidget(widgetData, subredditName));
          break;
        case 'textarea':
          widgets.push(new TextAreaWidget(widgetData, subredditName));
          break;
        case 'button':
          widgets.push(new ButtonWidget(widgetData, subredditName));
          break;
        case 'community-list':
          widgets.push(new CommunityListWidget(widgetData, subredditName));
          break;
        case 'post-flair':
          widgets.push(new PostFlairWidget(widgetData, subredditName));
          break;
        case 'custom':
          widgets.push(new CustomWidget(widgetData, subredditName));
          break;
        case 'subreddit-rules': {
          // subreddit rule widget does not contain any data
          // we need to fetch it separately
          const rulesRsp = await getRedditApiPlugins().Subreddits.SubredditAboutRules(
            {
              subreddit: subredditName,
            },
            getMetadata()
          );
          widgets.push(new SubredditRulesWidget(rulesRsp, widgetData, subredditName));
          break;
        }
        default:
          throw new Error(`Unknown widget type: ${widgetData.kind}`);
      }
    }

    return widgets;
  }

  /** @internal */
  static async delete(subredditName: string, id: string): Promise<void> {
    const client = getRedditApiPlugins().Widgets;

    await client.DeleteWidget(
      {
        subreddit: subredditName,
        id,
      },
      getMetadata()
    );
  }

  /** @internal */
  static async reorder(subredditName: string, orderByIds: string[]): Promise<void> {
    const client = getRedditApiPlugins().Widgets;

    await client.OrderWidgets(
      {
        subreddit: subredditName,
        order: orderByIds,
      },
      getMetadata()
    );
  }

  /** @internal */
  static async add(widgetData: AddWidgetData): Promise<Widget> {
    // Styles are optional in the proto create requests, but are required by r2
    widgetData.styles = {
      backgroundColor: widgetData.styles?.backgroundColor ?? '',
      headerColor: widgetData.styles?.headerColor ?? '',
    };

    switch (widgetData?.type) {
      case 'image':
        return ImageWidget.create(widgetData);
      case 'calendar':
        return CalendarWidget.create(widgetData);
      case 'textarea':
        return TextAreaWidget.create(widgetData);
      case 'button':
        return ButtonWidget.create(widgetData);
      case 'community-list':
        return CommunityListWidget.create(widgetData);
      case 'post-flair':
        return PostFlairWidget.create(widgetData);
      case 'custom':
        return CustomWidget.create(widgetData);
      default:
        throw new Error(`Unknown widget type: ${widgetData satisfies never}`);
    }
  }

  /** @internal */
  static async patch(widgetData: UpdateWidgetData): Promise<Widget> {
    // Styles are optional in the proto update requests, but are required by r2
    widgetData.styles = {
      backgroundColor: widgetData.styles?.backgroundColor ?? '',
      headerColor: widgetData.styles?.headerColor ?? '',
    };

    switch (widgetData?.type) {
      case 'image':
        return ImageWidget.update(widgetData);
      case 'calendar':
        return CalendarWidget.update(widgetData);
      case 'textarea':
        return TextAreaWidget.update(widgetData);
      case 'button':
        return ButtonWidget.update(widgetData);
      case 'community-list':
        return CommunityListWidget.update(widgetData);
      case 'post-flair':
        return PostFlairWidget.update(widgetData);
      case 'custom':
        return CustomWidget.update(widgetData);
      default:
        throw new Error(`Unknown widget type: ${widgetData satisfies never}`);
    }
  }
}

export class ImageWidget extends Widget {
  #images: WidgetImage[];

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    this.#images = widgetData.data.map((data) => {
      assertNonNull(data.url, 'Image widget data is missing url');
      assertNonNull(data.height, 'Image widget data is missing height');
      assertNonNull(data.width, 'Image widget data is missing width');

      return {
        url: data.url,
        height: data.height,
        width: data.width,
        linkUrl: data.linkUrl ?? '',
      };
    });
  }

  get images(): WidgetImage[] {
    return this.#images;
  }

  override toJSON(): ReturnType<Widget['toJSON']> & Pick<ImageWidget, 'images'> {
    return {
      ...super.toJSON(),
      images: this.images,
    };
  }

  /** @internal */
  static async create(options: AddImageWidgetRequest): Promise<ImageWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddImageWidget(options, getMetadata());

    return new ImageWidget(
      {
        buttons: [],
        data: response.data.map((data) => ({
          children: [],
          height: data.height,
          linkUrl: data.linkUrl,
          url: data.url,
          width: data.width,
        })),
        kind: response.kind,
        id: response.id,
        imageData: [],
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdateImageWidgetRequest): Promise<ImageWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdateImageWidget(options, getMetadata());

    return new ImageWidget(
      {
        buttons: [],
        data: response.data.map((data) => ({
          children: [],
          height: data.height,
          linkUrl: data.linkUrl,
          url: data.url,
          width: data.width,
        })),
        kind: response.kind,
        id: response.id,
        imageData: [],
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }
}

export class CalendarWidget extends Widget {
  #googleCalendarId: string;
  #configuration: CalendarWidgetConfiguration;
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    assertNonNull(widgetData.googleCalendarId, 'Calendar widget data is missing googleCalendarId');
    assertNonNull(widgetData.configuration, 'Calendar widget data is missing configuration');
    assertNonNull(widgetData.styles, 'Calendar widget data is missing styles');

    this.#googleCalendarId = widgetData.googleCalendarId;
    this.#configuration = widgetData.configuration;
    this.#styles = widgetData.styles;
  }

  get googleCalendarId(): string {
    return this.#googleCalendarId;
  }

  get configuration(): CalendarWidgetConfiguration {
    return this.#configuration;
  }

  get styles(): WidgetStyles {
    return this.#styles;
  }

  override toJSON(): ReturnType<Widget['toJSON']> &
    Pick<CalendarWidget, 'googleCalendarId' | 'configuration' | 'styles'> {
    return {
      ...super.toJSON(),
      googleCalendarId: this.googleCalendarId,
      configuration: this.configuration,
      styles: this.styles,
    };
  }

  /** @internal */
  static async create(options: AddCalendarWidgetRequest): Promise<CalendarWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddCalendarWidget(options, getMetadata());

    return new CalendarWidget(
      {
        buttons: [],
        configuration: response.configuration,
        data: [],
        googleCalendarId: response.googleCalendarId,
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        requiresSync: response.requiresSync,
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdateCalendarWidgetRequest): Promise<CalendarWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdateCalendarWidget(options, getMetadata());

    return new CalendarWidget(
      {
        buttons: [],
        configuration: response.configuration,
        data: [],
        googleCalendarId: response.googleCalendarId,
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        requiresSync: response.requiresSync,
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }
}

export class TextAreaWidget extends Widget {
  #text: string;
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    assertNonNull(widgetData.text, 'Textarea widget data is missing text');
    assertNonNull(widgetData.styles, 'Textarea widget data is missing styles');

    this.#text = widgetData.text;
    this.#styles = widgetData.styles;
  }

  get text(): string {
    return this.#text;
  }

  get styles(): WidgetStyles {
    return this.#styles;
  }

  override toJSON(): ReturnType<Widget['toJSON']> & Pick<TextAreaWidget, 'text' | 'styles'> {
    return {
      ...super.toJSON(),
      text: this.text,
      styles: this.styles,
    };
  }

  /** @internal */
  static async create(options: AddTextAreaWidgetRequest): Promise<TextAreaWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddTextAreaWidget(options, getMetadata());

    return new TextAreaWidget(
      {
        buttons: [],
        data: [],
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
        text: response.text,
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdateTextAreaWidgetRequest): Promise<TextAreaWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdateTextAreaWidget(options, getMetadata());

    return new TextAreaWidget(
      {
        buttons: [],
        data: [],
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
        text: response.text,
      },
      options.subreddit
    );
  }
}

export class ButtonWidget extends Widget {
  #buttons: WidgetButton[];
  #description: string;
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    assertNonNull(widgetData.styles, 'Button widget data is missing styles');

    this.#buttons = widgetData.buttons;
    this.#description = widgetData.description ?? '';
    this.#styles = widgetData.styles;
  }

  get buttons(): WidgetButton[] {
    return this.#buttons;
  }

  get description(): string {
    return this.#description;
  }

  get styles(): WidgetStyles {
    return this.#styles;
  }

  override toJSON(): ReturnType<Widget['toJSON']> &
    Pick<ButtonWidget, 'buttons' | 'description' | 'styles'> {
    return {
      ...super.toJSON(),
      buttons: this.buttons,
      description: this.description,
      styles: this.styles,
    };
  }

  /** @internal */
  static async create(options: AddButtonWidgetRequest): Promise<ButtonWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddButtonWidget(options, getMetadata());

    return new ButtonWidget(
      {
        buttons: response.buttons,
        data: [],
        description: response.description,
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdateButtonWidgetRequest): Promise<ButtonWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdateButtonWidget(options, getMetadata());

    return new ButtonWidget(
      {
        buttons: response.buttons,
        data: [],
        description: response.description,
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }
}

export class CommunityListWidget extends Widget {
  #communities: CommunityData[];
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    this.#communities = widgetData.data.map((data) => ({
      children: data.children,
      communityIcon: data.communityIcon ?? '',
      height: data.height,
      iconUrl: data.iconUrl ?? '',
      isNsfw: data.isNsfw ?? false,
      isSubscribed: data.isSubscribed ?? false,
      linkUrl: data.linkUrl,
      name: data.name ?? '',
      prefixedName: data.prefixedName ?? '',
      primaryColor: '',
      subscribers: data.subscribers ?? 0,
      text: data.text,
      type: data.type ?? '',
      url: data.url,
      width: data.width,
    }));

    assertNonNull(widgetData.styles, 'Community list widget data is missing styles');

    this.#styles = widgetData.styles;
  }

  get communities(): CommunityData[] {
    return this.#communities;
  }

  get styles(): WidgetStyles {
    return this.#styles;
  }

  override toJSON(): ReturnType<Widget['toJSON']> &
    Pick<CommunityListWidget, 'communities' | 'styles'> {
    return {
      ...super.toJSON(),
      communities: this.communities,
      styles: this.styles,
    };
  }

  /** @internal */
  static async create(options: AddCommunityListWidgetRequest): Promise<CommunityListWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddCommunityListWidget(options, getMetadata());

    return new CommunityListWidget(
      {
        buttons: [],
        kind: response.kind,
        data: response.data.map((community) => ({
          children: [],
          communityIcon: community.communityIcon,
          iconUrl: community.iconUrl,
          isNsfw: community.isNsfw,
          isSubscribed: community.isSubscribed,
          name: community.name,
          prefixedName: community.prefixedName,
          primaryColor: community.primaryColor,
          subscribers: community.subscribers,
          type: community.type,
        })),
        id: response.id,
        imageData: [],
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdateCommunityListWidgetRequest): Promise<CommunityListWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdateCommunityListWidget(options, getMetadata());

    return new CommunityListWidget(
      {
        buttons: [],
        data: response.data.map((data) => ({ text: data, children: [] })),
        id: '',
        imageData: [],
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }
}

export class PostFlairWidget extends Widget {
  #styles: WidgetStyles;
  #templates: PostFlairTemplateData[];
  #display: 'list' | 'cloud';

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    assertNonNull(widgetData.styles, 'Post flair widget data is missing styles');

    this.#styles = widgetData.styles;
    this.#templates = widgetData.order.map((templateId) => widgetData.templates[templateId]);

    if (
      !((widgetData.display && widgetData.display === 'list') || widgetData.display === 'cloud')
    ) {
      throw new Error('Post flair widget data is missing display type');
    }

    this.#display = widgetData.display;
  }

  get styles(): WidgetStyles {
    return this.#styles;
  }

  get templates(): PostFlairTemplateData[] {
    return this.#templates;
  }

  get display(): 'list' | 'cloud' {
    return this.#display;
  }

  override toJSON(): ReturnType<Widget['toJSON']> &
    Pick<PostFlairWidget, 'templates' | 'display' | 'styles'> {
    return {
      ...super.toJSON(),
      styles: this.styles,
      templates: this.templates,
      display: this.display,
    };
  }

  /** @internal */
  static async create(options: AddPostFlairWidgetRequest): Promise<PostFlairWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddPostFlairWidget(options, getMetadata());

    return new PostFlairWidget(
      {
        buttons: [],
        data: [],
        display: response.display,
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: response.order,
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdatePostFlairWidgetRequest): Promise<PostFlairWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdatePostFlairWidget(options, getMetadata());

    return new PostFlairWidget(
      {
        buttons: [],
        data: [],
        display: response.display,
        id: response.id,
        imageData: [],
        kind: response.kind,
        mods: [],
        order: response.order,
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
      },
      options.subreddit
    );
  }
}

export class CustomWidget extends Widget {
  #images: WidgetImage[];
  #text: string;
  #stylesheetUrl: string;
  #height: number;
  #css: string;

  constructor(widgetData: WidgetItem, subredditName: string) {
    super(widgetData, subredditName);

    assertNonNull(widgetData.stylesheetUrl, 'Custom widget data is missing stylesheetUrl');
    assertNonNull(widgetData.height, 'Custom widget data is missing height');
    assertNonNull(widgetData.css, 'Custom widget data is missing css');

    this.#images = widgetData.imageData ?? [];
    this.#text = widgetData.text ?? '';
    this.#stylesheetUrl = widgetData.stylesheetUrl;
    this.#height = widgetData.height;
    this.#css = widgetData.css;
  }

  get images(): WidgetImage[] {
    return this.#images;
  }

  get text(): string {
    return this.#text;
  }

  get stylesheetUrl(): string {
    return this.#stylesheetUrl;
  }

  get height(): number {
    return this.#height;
  }

  get css(): string {
    return this.#css;
  }

  override toJSON(): ReturnType<Widget['toJSON']> &
    Pick<CustomWidget, 'images' | 'text' | 'stylesheetUrl' | 'height' | 'css'> {
    return {
      ...super.toJSON(),
      images: this.images,
      text: this.text,
      stylesheetUrl: this.stylesheetUrl,
      height: this.height,
      css: this.css,
    };
  }

  /** @internal */
  static async create(options: AddCustomWidgetRequest): Promise<CustomWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.AddCustomWidget(options, getMetadata());

    return new CustomWidget(
      {
        buttons: [],
        css: response.css,
        data: [],
        height: response.height,
        id: response.id,
        imageData: response.imageData,
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
        stylesheetUrl: '',
        text: response.text,
      },
      options.subreddit
    );
  }

  /** @internal */
  static async update(options: UpdateCustomWidgetRequest): Promise<CustomWidget> {
    const client = getRedditApiPlugins().Widgets;
    const response = await client.UpdateCustomWidget(options, getMetadata());

    return new CustomWidget(
      {
        buttons: [],
        css: response.css,
        data: [],
        height: response.height,
        id: response.id,
        imageData: response.imageData,
        kind: response.kind,
        mods: [],
        order: [],
        shortName: response.shortName,
        styles: response.styles,
        templates: {},
        stylesheetUrl: '',
        text: response.text,
      },
      options.subreddit
    );
  }
}

type SubredditRule = {
  description: string;
  priority: number;
  shortName: string;
  violationReason: string;
};

export class SubredditRulesWidget extends Widget {
  readonly #rules: SubredditRule[];

  constructor(
    subredditAboutRulesRsp: SubredditAboutRulesResponse,
    widgetData: WidgetItem,
    subredditName: string
  ) {
    super(widgetData, subredditName);

    this.#rules = subredditAboutRulesRsp.rules.map(
      ({ description, priority, shortName, violationReason }) => {
        assertNonNull(description, 'Subreddit rule is missing description');
        assertNonNull(priority, 'Subreddit rule is missing priority');
        assertNonNull(shortName, 'Subreddit rule is missing shortName');
        assertNonNull(violationReason, 'Subreddit rule is missing violationReason');
        return {
          description,
          priority,
          shortName,
          violationReason,
        };
      }
    );
  }

  get rules(): SubredditRule[] {
    return this.#rules;
  }

  override toJSON(): ReturnType<Widget['toJSON']> & Pick<SubredditRulesWidget, 'rules'> {
    return {
      ...super.toJSON(),
      rules: this.rules,
    };
  }
}
