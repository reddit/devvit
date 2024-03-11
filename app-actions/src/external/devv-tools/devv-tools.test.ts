import { DevvTools, DevvToolsMode } from './devv-tools.js';
import type { BlockElement, Devvit } from '@devvit/public-api';
import type { Mock } from 'vitest';
import type { AppActionsProps, DevToolbarAction } from './types/internal.js';
import { redisHandler } from './redis-mock-service/index.js';
import { redditApiHandler } from './reddit-api-mock-service/index.js';
import { httpHandler, httpResponse } from './http-mock-service/index.js';

describe('devv-tools', () => {
  const mockContext: Devvit.Context = {
    useState: vi.fn(),
    redis: {
      get: vi.fn(),
    },
    reddit: {
      getSubredditById: vi.fn(),
      getCurrentUser: vi.fn(),
    },
  } as unknown as Devvit.Context;

  afterEach(() => {
    (mockContext.useState as Mock).mockReset();
    (mockContext.redis.get as Mock).mockReset();
    (mockContext.reddit.getSubredditById as Mock).mockReset();
    (mockContext.reddit.getCurrentUser as Mock).mockReset();
  });

  describe('init toolbar', () => {
    it('returns the toolbar component', () => {
      const fakeState = [{}, () => {}];
      (mockContext.useState as Mock).mockReturnValue(fakeState);
      const ActionToolbarWrapper = DevvTools.toolbar({
        context: mockContext,
        mode: DevvToolsMode.Dev,
      });
      expect(ActionToolbarWrapper).toBeDefined();
    });

    it('passes the real settings when the production mode is active', () => {
      const fakeState = ['state value', () => {}];
      (mockContext.useState as Mock).mockReturnValue(fakeState);
      const ActionToolbarWrapper = DevvTools.toolbar({
        context: mockContext,
        mode: DevvToolsMode.Prod,
      });
      expect(mockContext.useState).toHaveBeenCalledOnce();
      //simulate rendering
      const renderedToolbar = ActionToolbarWrapper({}, mockContext) as BlockElement;
      expect((renderedToolbar.props as AppActionsProps).allowedUserString).toBe(fakeState[0]);
    });

    it('passes the full access when the development mode is active', () => {
      const fakeState = ['state value', () => {}];
      (mockContext.useState as Mock).mockReturnValue(fakeState);
      const ActionToolbarWrapper = DevvTools.toolbar({
        context: mockContext,
        mode: DevvToolsMode.Dev,
      });
      expect(mockContext.useState).toHaveBeenCalledOnce();
      //simulate rendering
      const renderedToolbar = ActionToolbarWrapper({}, mockContext) as BlockElement;

      expect((renderedToolbar.props as AppActionsProps).allowedUserString).toBe('*');
    });

    it('passes the actions defined by consumer', () => {
      const fakeState = ['state value', () => {}];
      (mockContext.useState as Mock).mockReturnValue(fakeState);
      const ActionToolbarWrapper = DevvTools.toolbar({
        context: mockContext,
        mode: DevvToolsMode.Prod,
      });
      //simulate rendering
      const action1: DevToolbarAction = {
        run: () => {},
      };
      const action2: DevToolbarAction = {
        run: () => {},
        label: 'Test action',
      };
      const renderedToolbar = ActionToolbarWrapper(
        { actions: [action1, action2] },
        mockContext
      ) as BlockElement;
      expect((renderedToolbar.props as AppActionsProps).actions).toContain(action1);
      expect((renderedToolbar.props as AppActionsProps).actions).toContain(action2);
    });

    it('passes the children defined by consumer', () => {
      const fakeState = ['state value', () => {}];
      (mockContext.useState as Mock).mockReturnValue(fakeState);
      const ActionToolbarWrapper = DevvTools.toolbar({
        context: mockContext,
        mode: DevvToolsMode.Prod,
      });
      //simulate rendering
      const renderedToolbar = ActionToolbarWrapper(
        { children: 'text' },
        mockContext
      ) as BlockElement;
      expect(renderedToolbar.children).toContain('text');
    });
  });
  describe('init api', () => {
    describe('redis', () => {
      it('returns devvRedis', () => {
        const devvToolsObject = DevvTools.api({ context: mockContext, mode: DevvToolsMode.Prod });
        expect(devvToolsObject.devvRedis).toBeDefined();
      });

      it('returns devvRedis that calls the original method if no handlers are provided', async () => {
        (mockContext.redis.get as Mock).mockResolvedValue('real redis');
        const devvToolsObject = DevvTools.api({ context: mockContext, mode: DevvToolsMode.Dev });
        const response = await devvToolsObject.devvRedis.get('regular_key');
        expect(mockContext.redis.get).toBeCalledWith('regular_key');
        expect(mockContext.redis.get).toHaveBeenCalledOnce();
        expect(response).toBe('real redis');
      });

      it('returns devvRedis that applies mock responses', async () => {
        (mockContext.redis.get as Mock).mockResolvedValue('real redis');
        const devvToolsObject = DevvTools.api({
          context: mockContext,
          mode: DevvToolsMode.Dev,
          handlers: [redisHandler.get('mocked_key', () => 'mocked_response')],
        });
        const response = await devvToolsObject.devvRedis.get('mocked_key');
        expect(mockContext.redis.get).not.toBeCalled();
        expect(response).toBe('mocked_response');
      });

      it('ignores mocks in prod mode', async () => {
        (mockContext.redis.get as Mock).mockResolvedValue('real redis');
        const devvToolsObject = DevvTools.api({
          context: mockContext,
          mode: DevvToolsMode.Prod,
          handlers: [redisHandler.get('mocked_key', () => 'mocked_response')],
        });
        const response = await devvToolsObject.devvRedis.get('mocked_key');
        expect(mockContext.redis.get).toBeCalledWith('mocked_key');
        expect(mockContext.redis.get).toHaveBeenCalledOnce();
        expect(response).toBe('real redis');
      });
    });
    describe('redditApi', () => {
      it('returns devvRedditApi', () => {
        const devvToolsObject = DevvTools.api({ context: mockContext, mode: DevvToolsMode.Prod });
        expect(devvToolsObject.devvRedditApi).toBeDefined();
      });

      it('calls the original method if no handlers are provided', async () => {
        (mockContext.reddit.getCurrentUser as Mock).mockResolvedValue({ name: 'real_user' });
        const devvToolsObject = DevvTools.api({ context: mockContext, mode: DevvToolsMode.Dev });
        const response = await devvToolsObject.devvRedditApi.getCurrentUser();
        expect(mockContext.reddit.getCurrentUser).toHaveBeenCalledOnce();
        expect(response).toEqual({ name: 'real_user' });
      });

      it('calls the mock handler if provided', async () => {
        (mockContext.reddit.getSubredditById as Mock).mockResolvedValue({ name: 'realSubreddit' });
        const devvToolsObject = DevvTools.api({
          context: mockContext,
          mode: DevvToolsMode.Dev,
          handlers: [redditApiHandler.getSubredditById((id: string) => ({ name: `mock_${id}` }))],
        });
        const response = await devvToolsObject.devvRedditApi.getSubredditById('test');
        expect(mockContext.reddit.getSubredditById).not.toBeCalled();
        expect(response).toEqual({ name: 'mock_test' });
      });

      it('ignores mocks in prod mode', async () => {
        (mockContext.reddit.getSubredditById as Mock).mockResolvedValue({ name: 'realSubreddit' });
        const devvToolsObject = DevvTools.api({
          context: mockContext,
          mode: DevvToolsMode.Prod,
          handlers: [redditApiHandler.getSubredditById((id: string) => ({ name: `mock_${id}` }))],
        });
        const response = await devvToolsObject.devvRedditApi.getSubredditById('test');
        expect(mockContext.reddit.getSubredditById).toBeCalled();
        expect(response).toEqual({ name: 'realSubreddit' });
      });
    });

    describe('httpApi', () => {
      const mockFetch = vi.fn();
      const originalFetch = global.fetch;

      beforeEach(() => {
        mockFetch.mockReset();
        global.fetch = mockFetch;
      });

      afterEach(() => {
        global.fetch = originalFetch;
      });

      it('returns devvFetch', () => {
        const devvToolsObject = DevvTools.api({ context: mockContext, mode: DevvToolsMode.Prod });
        expect(devvToolsObject.devvFetch).toBeDefined();
      });

      it('calls the original method if no handlers are provided', async () => {
        mockFetch.mockResolvedValue({
          json: () => Promise.resolve({ real: 'data' }),
        });
        const devvToolsObject = DevvTools.api({ context: mockContext, mode: DevvToolsMode.Dev });
        const response = await devvToolsObject.devvFetch('https://example.com', {});
        expect(mockFetch).toHaveBeenCalledOnce();
        expect(mockFetch).toBeCalledWith('https://example.com', {});
        expect(await response.json()).toEqual({ real: 'data' });
      });

      it('uses handler if provided', async () => {
        const devvToolsObject = DevvTools.api({
          context: mockContext,
          mode: DevvToolsMode.Dev,
          handlers: [
            httpHandler.get('https://example.com', () => {
              return httpResponse.ok({ mocked: 'response' });
            }),
          ],
        });
        const response = await devvToolsObject.devvFetch('https://example.com', {
          method: 'GET',
        });
        expect(mockFetch).not.toBeCalled();
        expect(await response.json()).toEqual({ mocked: 'response' });
      });
    });
  });
});
