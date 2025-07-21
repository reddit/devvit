import fs from 'node:fs';
import path from 'node:path';

import { clientVersionQueryParam } from '@devvit/shared-types/web-view-scripts-constants.js';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { AssetUploader, DEVVIT_JS_URL, transformHTML } from './AssetUploader.js';
import type { DevvitCommand } from './commands/DevvitCommand.js';

describe('HTML Transformation', () => {
  describe('transformHTML', () => {
    it('should add script tag to head when head exists', () => {
      const input = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test</title>
          </head>
          <body>
            <h1>Hello</h1>
          </body>
        </html>
      `;
      const result = transformHTML(input, '1.2.3');
      const dom = new JSDOM(result);
      const document = dom.window.document;

      // Verify script tag exists in head
      const script = selectScript(document);
      assertScriptExpectations(script);

      // Verify original content is preserved
      expect(document.querySelector('title')?.textContent).toBe('Test');
      expect(document.querySelector('h1')?.textContent).toBe('Hello');
    });

    it('should create head tag and add script when head does not exist', () => {
      const input = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Hello</h1>
          </body>
        </html>
      `;
      const result = transformHTML(input, '1.2.3');
      const dom = new JSDOM(result);
      const document = dom.window.document;

      // Verify head tag exists
      const head = document.querySelector('head');
      expect(head).not.toBeNull();

      // Verify script tag exists in head
      const script = selectScript(document);
      assertScriptExpectations(script);

      // Verify body content is preserved
      expect(document.querySelector('h1')?.textContent).toBe('Hello');
    });

    it('should handle malformed HTML gracefully', () => {
      const input = `
        <html>
          <head>
            <title>Test
          </head>
          <body>
            <h1>Hello
          </body>
        </html>
      `;
      const result = transformHTML(input, '1.2.3');
      const dom = new JSDOM(result);
      const document = dom.window.document;

      // Verify script tag exists
      const script = document.querySelector(
        `script[src="${DEVVIT_JS_URL}?${clientVersionQueryParam}=1.2.3"]`
      );
      assertScriptExpectations(script);
    });

    it('should handle non-HTML gracefully', () => {
      const input = `
        <
      `;
      const result = transformHTML(input, '1.2.3');
      const dom = new JSDOM(result);
      const document = dom.window.document;

      // Verify script tag exists
      const script = document.querySelector(
        `script[src="${DEVVIT_JS_URL}?${clientVersionQueryParam}=1.2.3"]`
      );
      assertScriptExpectations(script);
    });

    it('should handle HTML with existing script tags', () => {
      const input = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="other.js"></script>
          </head>
          <body>
            <h1>Hello</h1>
          </body>
        </html>
      `;
      const result = transformHTML(input, '1.2.3');
      const dom = new JSDOM(result);
      const document = dom.window.document;

      // Verify both script tags exist
      const scripts = document.querySelectorAll('head script');
      expect(scripts.length).toBe(2);

      const otherScript = document.querySelector('script[src="other.js"]');
      expect(otherScript).not.toBeNull();

      const devvitScript = selectScript(document);
      assertScriptExpectations(devvitScript);
    });
  });
});

describe('assertAssetCanBeAnIcon', () => {
  const TEST_IMAGE_FILES = [
    '1024x1024.gif',
    '1024x1024.jpg',
    '1024x1024.png',
    '256x256.png',
    '256x512.png',
    '420x420.png',
    '512x512.png',
    'notAnImage.txt',
  ];

  for (const fileName of TEST_IMAGE_FILES) {
    it(`should match the snapshot for image file: ${fileName}`, async () => {
      const cmd = {
        error: vi.fn(() => {
          throw new Error('Mocked error');
        }),
        warn: vi.fn(),
      };
      const assetUploader = new AssetUploader(cmd as unknown as DevvitCommand, 'some-slug', {
        verbose: false,
      });
      const filePath = `../../testing-images/${fileName}`;
      const fileContent = fs.readFileSync(path.join(__dirname, filePath));

      // Don't care if this resolves or rejects, just want to test the error handling
      await Promise.allSettled([assetUploader.assertAssetCanBeAnIcon(fileContent)]);

      expect(cmd.error.mock.calls).toMatchSnapshot(`${fileName}-err`);
      expect(cmd.warn.mock.calls).toMatchSnapshot(`${fileName}-warn`);
    });
  }
});

function selectScript(document: Document): Element | null {
  return document.querySelector(
    `head script[src="${DEVVIT_JS_URL}?${clientVersionQueryParam}=1.2.3"]`
  );
}

function assertScriptExpectations(script: Element | null) {
  expect(script).not.toBeNull();
}
