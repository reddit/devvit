import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { ICON_FILE_PATH } from '@devvit/shared-types/constants.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { showShareSheet } from './share.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

const savedLocation = globalThis.location;
const savedFetch = globalThis.fetch;

describe('showShareSheet', () => {
  beforeEach(() => {
    globalThis.location = { origin: 'https://reddit.com' } as Location;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
  });

  afterEach(() => {
    globalThis.location = savedLocation;
    globalThis.fetch = savedFetch;
    vi.restoreAllMocks();
  });

  it('should call emitEffect with the correct effect', async () => {
    await showShareSheet({
      post: 't3_1se0nud',
      data: 'test data',
      text: 'test text',
      title: 'test title',
    });
    expect(emitEffect).toHaveBeenCalledWith({
      type: EffectType.EFFECT_WEB_VIEW,
      share: {
        url: 'https://reddit.com/comments/1se0nud',
        userData: 'test data',
        text: 'test text',
        title: 'test title',
        appIconUri: undefined,
      },
    });
  });

  it('should include appIconUri when the icon HEAD request succeeds', async () => {
    const expectedIconURL = new URL(ICON_FILE_PATH, 'https://reddit.com').toString();
    vi.mocked(globalThis.fetch).mockResolvedValue({ ok: true } as Response);

    await showShareSheet({});

    expect(globalThis.fetch).toHaveBeenCalledWith(expectedIconURL, { method: 'HEAD' });
    expect(emitEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        share: expect.objectContaining({ appIconUri: expectedIconURL }),
      })
    );
  });

  it('should set appIconUri to undefined when the icon HEAD request fails', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({ ok: false } as Response);

    await showShareSheet({});

    expect(emitEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        share: expect.objectContaining({ appIconUri: undefined }),
      })
    );
  });

  it('should call emitEffect without the url if it is not provided', async () => {
    await showShareSheet({
      data: 'test data',
      text: 'test text',
      title: 'test title',
    });
    expect(emitEffect).toHaveBeenCalledWith({
      type: EffectType.EFFECT_WEB_VIEW,
      share: {
        userData: 'test data',
        text: 'test text',
        title: 'test title',
        appIconUri: undefined,
      },
    });
  });
});
