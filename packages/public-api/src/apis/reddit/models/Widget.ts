import type {
  AddButtonWidgetRequest,
  AddCalendarWidgetRequest,
  AddCommunityListWidgetRequest,
  AddCustomWidgetRequest,
  AddImageWidgetRequest,
  AddPostFlairWidgetRequest,
  AddTextAreaWidgetRequest,
  CalendarWidgetConfiguration,
  GetWidgetsResponse_WidgetItem_PostFlairTemplate as PostFlairTemplateData,
  Metadata,
  SubredditAboutRulesResponse,
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
} from '@devvit/protos';
import {
  CommunityListWidget_CommunityData as CommunityData,
  GetWidgetsResponse_WidgetItem as WidgetItem,
} from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { Devvit } from '../../../devvit/Devvit.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';

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

export class Widget {
  #id: string;
  #name: string;
  #subredditName: string;

  #metadata: Metadata | undefined;

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    makeGettersEnumerable(this);

    this.#id = widgetData.id;
    this.#name = widgetData.shortName;
    this.#subredditName = subredditName;
    this.#metadata = metadata;
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
    return Widget.delete(this.subredditName, this.id, this.#metadata);
  }

  /**
   * @internal
   * @note - This method only returns the widgets listed on the sidebar.
   */
  static async getWidgets(
    subredditName: string,
    metadata: Metadata | undefined
  ): Promise<Widget[]> {
    const client = Devvit.redditAPIPlugins.Widgets;

    const response = await client.GetWidgets(
      {
        subreddit: subredditName,
      },
      metadata
    );

    assertNonNull(response.layout, 'Failed to load widgets for subreddit');

    const widgetsMap = response.items;

    const widgets: Widget[] = [];

    for (const widgetId of response.layout.sidebar?.order ?? []) {
      const widgetData = widgetsMap[widgetId];
      switch (widgetData?.kind) {
        case 'image':
          widgets.push(new ImageWidget(widgetData, subredditName, metadata));
          break;
        case 'calendar':
          widgets.push(new CalendarWidget(widgetData, subredditName, metadata));
          break;
        case 'textarea':
          widgets.push(new TextAreaWidget(widgetData, subredditName, metadata));
          break;
        case 'button':
          widgets.push(new ButtonWidget(widgetData, subredditName, metadata));
          break;
        case 'community-list':
          widgets.push(new CommunityListWidget(widgetData, subredditName, metadata));
          break;
        case 'post-flair':
          widgets.push(new PostFlairWidget(widgetData, subredditName, metadata));
          break;
        case 'custom':
          widgets.push(new CustomWidget(widgetData, subredditName, metadata));
          break;
        case 'subreddit-rules': {
          // subreddit rule widget does not contain any data
          // we need to fetch it separately
          const rulesRsp = await Devvit.redditAPIPlugins.Subreddits.SubredditAboutRules(
            {
              subreddit: subredditName,
            },
            metadata
          );
          widgets.push(new SubredditRulesWidget(rulesRsp, widgetData, subredditName, metadata));
          break;
        }
        default:
          throw new Error(`Unknown widget type: ${widgetData.kind}`);
      }
    }

    return widgets;
  }

  /** @internal */
  static async delete(
    subredditName: string,
    id: string,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Widgets;

    await client.DeleteWidget(
      {
        subreddit: subredditName,
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async reorder(
    subredditName: string,
    orderByIds: string[],
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Widgets;

    await client.OrderWidgets(
      {
        subreddit: subredditName,
        order: orderByIds,
      },
      metadata
    );
  }

  /** @internal */
  static async add(widgetData: AddWidgetData, metadata: Metadata | undefined): Promise<Widget> {
    switch (widgetData?.type) {
      case 'image':
        return ImageWidget.create(widgetData, metadata);
      case 'calendar':
        return CalendarWidget.create(widgetData, metadata);
      case 'textarea':
        return TextAreaWidget.create(widgetData, metadata);
      case 'button':
        return ButtonWidget.create(widgetData, metadata);
      case 'community-list':
        return CommunityListWidget.create(widgetData, metadata);
      case 'post-flair':
        return PostFlairWidget.create(widgetData, metadata);
      case 'custom':
        return CustomWidget.create(widgetData, metadata);
      default:
        throw new Error('Unknown widget type');
    }
  }
}

export class ImageWidget extends Widget {
  #images: WidgetImage[];

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

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
  static async create(
    options: AddImageWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<ImageWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddImageWidget(options, metadata);

    return new ImageWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdateImageWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<ImageWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdateImageWidget(options, metadata);

    return new ImageWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }
}

export class CalendarWidget extends Widget {
  #googleCalendarId: string;
  #configuration: CalendarWidgetConfiguration;
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

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
  static async create(
    options: AddCalendarWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<CalendarWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddCalendarWidget(options, metadata);

    return new CalendarWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdateCalendarWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<CalendarWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdateCalendarWidget(options, metadata);

    return new CalendarWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }
}

export class TextAreaWidget extends Widget {
  #text: string;
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

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
  static async create(
    options: AddTextAreaWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<TextAreaWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddTextAreaWidget(options, metadata);

    return new TextAreaWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdateTextAreaWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<TextAreaWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdateTextAreaWidget(options, metadata);

    return new TextAreaWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }
}

export class ButtonWidget extends Widget {
  #buttons: WidgetButton[];
  #description: string;
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

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
  static async create(
    options: AddButtonWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<ButtonWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddButtonWidget(options, metadata);

    return new ButtonWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdateButtonWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<ButtonWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdateButtonWidget(options, metadata);

    return new ButtonWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }
}

export class CommunityListWidget extends Widget {
  #communities: CommunityData[];
  #styles: WidgetStyles;

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

    this.#communities = widgetData.data.map((communityData) =>
      CommunityData.fromJSON(communityData)
    );

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
  static async create(
    options: AddCommunityListWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<CommunityListWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddCommunityListWidget(options, metadata);

    return new CommunityListWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdateCommunityListWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<CommunityListWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdateCommunityListWidget(options, metadata);

    return new CommunityListWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }
}

export class PostFlairWidget extends Widget {
  #styles: WidgetStyles;
  #templates: PostFlairTemplateData[];
  #display: 'list' | 'cloud';

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

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
  static async create(
    options: AddPostFlairWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<PostFlairWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddPostFlairWidget(options, metadata);

    return new PostFlairWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdatePostFlairWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<PostFlairWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdatePostFlairWidget(options, metadata);

    return new PostFlairWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }
}

export class CustomWidget extends Widget {
  #images: WidgetImage[];
  #text: string;
  #stylesheetUrl: string;
  #height: number;
  #css: string;

  constructor(widgetData: WidgetItem, subredditName: string, metadata: Metadata | undefined) {
    super(widgetData, subredditName, metadata);

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
  static async create(
    options: AddCustomWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<CustomWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.AddCustomWidget(options, metadata);

    return new CustomWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
  }

  /** @internal */
  static async update(
    options: UpdateCustomWidgetRequest,
    metadata: Metadata | undefined
  ): Promise<CustomWidget> {
    const client = Devvit.redditAPIPlugins.Widgets;
    const response = await client.UpdateCustomWidget(options, metadata);

    return new CustomWidget(WidgetItem.fromJSON(response), options.subreddit, metadata);
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
    subredditName: string,
    metadata: Metadata | undefined
  ) {
    super(widgetData, subredditName, metadata);

    const rules = subredditAboutRulesRsp.rules.map(
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

    this.#rules = rules;
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
