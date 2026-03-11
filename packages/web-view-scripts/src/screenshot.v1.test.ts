import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { captureScreenshot } from './screenshot.v1.js';

const { toCanvasMock } = vi.hoisted(() => {
  const toCanvasMock: Mock = vi.fn();
  return { toCanvasMock };
});

vi.mock('html-to-image', () => ({
  toCanvas: toCanvasMock,
}));

describe('screenshot.v1', () => {
  beforeEach(() => {
    globalThis.devicePixelRatio = 2;
    globalThis.document = { body: {} as HTMLElement } as Document;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('captures screenshot dataUrl when capture succeeds', async () => {
    toCanvasMock.mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockImageData'),
    });

    const dataUrl = await captureScreenshot();

    expect(toCanvasMock).toHaveBeenCalledTimes(1);
    expect(dataUrl).toBe('data:image/png;base64,mockImageData');
  });

  it('throws when capture fails', async () => {
    toCanvasMock.mockRejectedValue(new Error('capture failed'));

    await expect(captureScreenshot()).rejects.toThrow('capture failed');
  });
});
