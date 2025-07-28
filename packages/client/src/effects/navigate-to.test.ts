import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockComment, mockPost, mockSubreddit, mockUser } from './helpers/test-helpers.js';
import { navigateTo } from './navigate-to.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

describe('navigateTo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
