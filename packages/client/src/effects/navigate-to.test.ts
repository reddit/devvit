import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockComment, mockPost, mockSubreddit, mockUser } from './helpers/test-helpers.js';
import { navigateTo, navigateToPost } from './navigate-to.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('navigateTo', () => {
  it('should handle direct URL navigation', () => {
    const url = 'https://www.reddit.com/r/test';
    navigateTo(url);

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: { url },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should handle subreddit navigation', () => {
    navigateTo(mockSubreddit);

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://www.reddit.com/r/test',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should handle post navigation', () => {
    navigateTo(mockPost);

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://www.reddit.com/r/test/comments/123/test_post',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should handle comment navigation', () => {
    navigateTo(mockComment);

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://www.reddit.com/r/test/comments/123/test_post/comment',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should handle user navigation', () => {
    navigateTo(mockUser);

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://www.reddit.com/user/testuser',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should throw error for invalid URL', () => {
    expect(() => navigateTo('not-a-url')).toThrow();
  });
});

describe('navigateToPost', () => {
  it('should navigate to a post without options', () => {
    navigateToPost('t3_123');

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://reddit.com/r/_/comments/123',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should encode the title in the navigation URL', () => {
    navigateToPost('t3_123', { title: 'Play & win!' });

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://reddit.com/r/_/comments/123?devvitshare=%7B%22title%22%3A%22Play+%26+win%21%22%7D',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should encode the presentation in the navigation URL', () => {
    navigateToPost('t3_123', { presentation: 'expanded' });

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://reddit.com/r/_/comments/123?devvitshare=%7B%22presentation%22%3A1%7D',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });

  it('should encode the title and presentation in the navigation URL', () => {
    navigateToPost('t3_123', {
      title: 'Play & win!',
      presentation: 'expanded',
    });

    expect(emitEffect).toHaveBeenCalledWith({
      navigateToUrl: {
        url: 'https://reddit.com/r/_/comments/123?devvitshare=%7B%22title%22%3A%22Play+%26+win%21%22%2C%22presentation%22%3A1%7D',
      },
      type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
    });
  });
});
