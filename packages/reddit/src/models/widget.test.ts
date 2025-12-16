import type {
  AddButtonWidgetRequest,
  AddCalendarWidgetRequest,
  AddCommunityListWidgetRequest,
  AddCustomWidgetRequest,
  AddImageWidgetRequest,
  AddPostFlairWidgetRequest,
  AddTextAreaWidgetRequest,
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
import type { MockInstance } from 'vitest';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { RedditApiPluginClient } from '../plugin.js';
import { getRedditApiPlugins } from '../plugin.js';
import { runWithTestContext } from '../tests/utils/runWithTestContext.js';
import {
  ButtonWidget,
  CalendarWidget,
  CommunityListWidget,
  CustomWidget,
  ImageWidget,
  PostFlairWidget,
  TextAreaWidget,
} from './Widget.js';

vi.mock('../plugin.js', async () => {
  const actual = await vi.importActual<typeof import('../plugin.js')>('../plugin.js');
  return {
    ...actual,
    getRedditApiPlugins: vi.fn().mockReturnValue({
      Widgets: {
        AddImageWidget: vi.fn(),
        UpdateImageWidget: vi.fn(),
        AddCalendarWidget: vi.fn(),
        UpdateCalendarWidget: vi.fn(),
        AddTextAreaWidget: vi.fn(),
        UpdateTextAreaWidget: vi.fn(),
        AddButtonWidget: vi.fn(),
        UpdateButtonWidget: vi.fn(),
        AddCommunityListWidget: vi.fn(),
        UpdateCommunityListWidget: vi.fn(),
        AddPostFlairWidget: vi.fn(),
        UpdatePostFlairWidget: vi.fn(),
        AddCustomWidget: vi.fn(),
        UpdateCustomWidget: vi.fn(),
      },
    }),
  };
});

const styles: Readonly<WidgetStyles> = { backgroundColor: '#000', headerColor: '#111' };

type WidgetsMock = {
  [K in keyof RedditApiPluginClient['Widgets']]: MockInstance<RedditApiPluginClient['Widgets'][K]>;
};

describe('Widget model create/update helpers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('ImageWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const imageData: WidgetImage[] = [{ url: 'url', linkUrl: 'linkUrl', height: 10, width: 20 }];
      const response = {
        id: 'id',
        kind: 'image',
        shortName: 'shortName',
        data: imageData,
        styles,
      };
      widgets.AddImageWidget.mockResolvedValue(response);
      widgets.UpdateImageWidget.mockResolvedValue(response);

      const addReq: AddImageWidgetRequest = {
        subreddit: 'subreddit',
        data: imageData,
        shortName: 'shortName',
        styles,
      };
      const updateReq: UpdateImageWidgetRequest = {
        subreddit: 'subreddit',
        id: 'id',
        data: imageData,
        shortName: 'shortName',
        styles,
      };

      const created = await ImageWidget.create(addReq);
      expect(created.images).toStrictEqual(imageData);

      const updated = await ImageWidget.update(updateReq);
      expect(updated.images).toStrictEqual(created.images);
    });
  });

  test('CalendarWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const baseResponse = {
        id: 'id',
        kind: 'calendar',
        shortName: 'shortName',
        googleCalendarId: 'googleCalendarId',
        requiresSync: false,
        configuration: {
          numEvents: 1,
          showDate: true,
          showDescription: false,
          showLocation: false,
          showTime: true,
          showTitle: true,
        },
        styles,
      };
      widgets.AddCalendarWidget.mockResolvedValue(baseResponse);
      widgets.UpdateCalendarWidget.mockResolvedValue(baseResponse);

      const addReq: AddCalendarWidgetRequest = {
        subreddit: 'subreddit',
        googleCalendarId: 'googleCalendarId',
        requiresSync: false,
        shortName: 'shortName',
        configuration: baseResponse.configuration,
        styles,
      };

      const updateReq: UpdateCalendarWidgetRequest = {
        ...addReq,
        id: 'id',
      };

      const created = await CalendarWidget.create(addReq);
      expect(created.googleCalendarId).toBe('googleCalendarId');

      const updated = await CalendarWidget.update(updateReq);
      expect(updated.configuration).toStrictEqual(baseResponse.configuration);
    });
  });

  test('TextAreaWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const baseResponse = {
        id: 'id',
        kind: 'textarea',
        shortName: 'shortName',
        text: 'text',
        styles,
      };
      widgets.AddTextAreaWidget.mockResolvedValue(baseResponse);
      widgets.UpdateTextAreaWidget.mockResolvedValue(baseResponse);

      const addReq: AddTextAreaWidgetRequest = {
        subreddit: 'subreddit',
        shortName: 'shortName',
        text: 'text',
        styles,
      };
      const updateReq: UpdateTextAreaWidgetRequest = {
        ...addReq,
        id: 'id',
      };

      const created = await TextAreaWidget.create(addReq);
      expect(created.text).toBe('text');

      const updated = await TextAreaWidget.update(updateReq);
      expect(updated.styles).toStrictEqual(styles);
    });
  });

  test('ButtonWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const buttons: WidgetButton[] = [{ kind: 'kind', text: 'text', url: 'url' }];
      const baseResponse = {
        id: 'id',
        kind: 'button',
        shortName: 'shortName',
        description: 'description',
        buttons,
        styles,
      };
      widgets.AddButtonWidget.mockResolvedValue(baseResponse);
      widgets.UpdateButtonWidget.mockResolvedValue(baseResponse);

      const addReq: AddButtonWidgetRequest = {
        subreddit: 'subreddit',
        shortName: 'shortName',
        description: 'description',
        buttons,
        styles,
      };
      const updateReq: UpdateButtonWidgetRequest = {
        ...addReq,
        id: 'id',
      };

      const created = await ButtonWidget.create(addReq);
      expect(created.buttons).toStrictEqual(buttons);

      const updated = await ButtonWidget.update(updateReq);
      expect(updated.description).toBe('description');
    });
  });

  test('CommunityListWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const baseResponse = {
        id: 'id',
        kind: 'community-list',
        shortName: 'shortName',
        data: [
          {
            communityIcon: 'communityIcon',
            iconUrl: 'iconUrl',
            isNsfw: false,
            isSubscribed: true,
            name: 'name',
            prefixedName: 'prefixedName',
            primaryColor: '#fff',
            subscribers: 1,
            type: 'public',
          },
        ],
        styles,
      };
      widgets.AddCommunityListWidget.mockResolvedValue(baseResponse);
      widgets.UpdateCommunityListWidget.mockResolvedValue({
        kind: 'community-list',
        shortName: 'shortName',
        data: ['name'],
        styles,
      });

      const addReq: AddCommunityListWidgetRequest = {
        subreddit: 'subreddit',
        shortName: 'shortName',
        data: ['name'],
        styles,
      };
      const updateReq: UpdateCommunityListWidgetRequest = {
        ...addReq,
        id: 'id',
      };

      const created = await CommunityListWidget.create(addReq);
      expect(created.communities[0]).toMatchObject({ name: 'name', prefixedName: 'prefixedName' });

      const updated = await CommunityListWidget.update(updateReq);
      expect(updated.communities).toHaveLength(1);
    });
  });

  test('PostFlairWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const baseResponse = {
        id: 'id',
        kind: 'post-flair',
        shortName: 'shortName',
        display: 'list',
        order: ['order'],
        styles,
        templates: {},
      };
      widgets.AddPostFlairWidget.mockResolvedValue(baseResponse);
      widgets.UpdatePostFlairWidget.mockResolvedValue(baseResponse);

      const addReq: AddPostFlairWidgetRequest = {
        subreddit: 'subreddit',
        shortName: 'shortName',
        display: 'list',
        order: ['order'],
        styles,
      };
      const updateReq: UpdatePostFlairWidgetRequest = {
        ...addReq,
        id: 'id',
      };

      const created = await PostFlairWidget.create(addReq);
      expect(created.display).toBe('list');

      const updated = await PostFlairWidget.update(updateReq);
      expect(updated.styles).toStrictEqual(styles);
    });
  });

  test('CustomWidget.create()', async () => {
    await runWithTestContext(async () => {
      const widgets = getRedditApiPlugins().Widgets as unknown as WidgetsMock;
      const imgs: WidgetImage[] = [{ url: 'url', linkUrl: 'linkUrl', height: 10, width: 20 }];
      const baseResponse = {
        id: 'id',
        kind: 'custom',
        shortName: 'shortName',
        text: 'text',
        height: 100,
        css: 'css',
        imageData: imgs,
        styles,
      };
      widgets.AddCustomWidget.mockResolvedValue(baseResponse);
      widgets.UpdateCustomWidget.mockResolvedValue(baseResponse);

      const addReq: AddCustomWidgetRequest = {
        subreddit: 'subreddit',
        shortName: 'shortName',
        text: 'text',
        height: 100,
        css: 'css',
        imageData: imgs,
        styles,
      };
      const updateReq: UpdateCustomWidgetRequest = {
        ...addReq,
        id: 'id',
      };

      const created = await CustomWidget.create(addReq);
      expect(created.height).toBe(100);
      expect(created.images).toStrictEqual(imgs);

      const updated = await CustomWidget.update(updateReq);
      expect(updated.css).toBe('css');
    });
  });
});
