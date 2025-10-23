import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { clientVersionQueryParam } from '@devvit/shared-types/web-view-scripts-constants.js';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AssetUploader, DEVVIT_JS_URL, queryAssets, transformHTML } from './AssetUploader.js';
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

describe('queryAssets()', () => {
  let tmpDir: string;

  beforeEach(() => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  `;

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devvit-test-'));
    fs.writeFileSync(path.join(tmpDir, 'index.html'), htmlContent);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should transform HTML files with Devvit script injection', async () => {
    const assets = await queryAssets(tmpDir, [], 'Client', '1.2.3', false);

    // Verify that one asset was found.
    expect(assets).toHaveLength(1);
    expect(assets[0].filePath).toBe('index.html');
    expect(assets[0].isWebviewAsset).toBe(true);

    // Verify that the HTML was transformed.
    const transformedContent = new TextDecoder('utf-8').decode(assets[0].contents);
    expect(transformedContent).toContain(
      `<script src="${DEVVIT_JS_URL}?${clientVersionQueryParam}=1.2.3"></script>`
    );
    expect(transformedContent).toContain('<title>Test Page</title>');
    expect(transformedContent).toContain('<h1>Hello World</h1>');
  });

  it('should skip HTML transformation when skipWebViewScriptInjection is true', async () => {
    const assets = await queryAssets(tmpDir, [], 'Client', '1.2.3', true);

    // Verify that one asset was found.
    expect(assets).toHaveLength(1);
    expect(assets[0].filePath).toBe('index.html');
    expect(assets[0].isWebviewAsset).toBe(true);

    // Verify that the HTML was NOT transformed.
    const untransformedContent = new TextDecoder('utf-8').decode(assets[0].contents);
    expect(untransformedContent).not.toContain(DEVVIT_JS_URL);
    expect(untransformedContent).toContain('<title>Test Page</title>');
    expect(untransformedContent).toContain('<h1>Hello World</h1>');
  });
});

function selectScript(document: Document): Element | null {
  return document.querySelector(
    `head script[src="${DEVVIT_JS_URL}?${clientVersionQueryParam}=1.2.3"]`
  );
}

function assertScriptExpectations(script: Element | null) {
  expect(script).not.toBeNull();
}
