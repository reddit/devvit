/**
 * Standalone screenshot capture module loaded via dynamic import.
 */
import * as htmlToImage from 'html-to-image';

export async function captureScreenshot(): Promise<string> {
  const canvas = await htmlToImage.toCanvas(document.body, {
    backgroundColor: '#ffffff',
    pixelRatio: globalThis.devicePixelRatio || 1,
  });
  return canvas.toDataURL('image/png');
}
