import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { DEVVIT_ANALYTICS_JS_URL, transformHTML } from './AssetUploader.js';

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
      const result = transformHTML(input);
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
      const result = transformHTML(input);
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
      const result = transformHTML(input);
      const dom = new JSDOM(result);
      const document = dom.window.document;

      // Verify script tag exists
      const script = document.querySelector(`script[src="${DEVVIT_ANALYTICS_JS_URL}"]`);
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
      const result = transformHTML(input);
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

function selectScript(document: Document): Element | null {
  return document.querySelector(`head script[src="${DEVVIT_ANALYTICS_JS_URL}"]`);
}

function assertScriptExpectations(script: Element | null) {
  expect(script).not.toBeNull();
  expect(script?.getAttribute('async')).toBe('');
  expect(script?.getAttribute('type')).toBe('module');
}
