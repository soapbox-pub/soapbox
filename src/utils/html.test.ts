import { describe, expect, it } from 'vitest';

import * as html from './html.ts';

describe('html', () => {
  describe('htmlToPlaintext', () => {
    it('converts html to plaintext, preserving linebreaks', () => {
      const output = html.htmlToPlaintext('<p>lorem</p><p>ipsum</p><br>&lt;br&gt;');
      expect(output).toEqual('lorem\n\nipsum\n<br>');
    });

    it('does not run event handlers in the HTML', async () => {
      (window as any).__xss = false;
      html.htmlToPlaintext('<img src="data:," onload="window.__xss = true" onerror="window.__xss = true">');
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect((window as any).__xss).toBe(false);
    });
  });

  describe('stripCompatibilityFeatures', () => {
    it('removes compatibility markup', () => {
      const output = html.stripCompatibilityFeatures('<p><span class="quote-inline">RT</span>hi</p>');
      expect(output).toEqual('<p>hi</p>');
    });

    it('does not create elements in the live document', () => {
      const output = html.parseHTML('<img src="x">');
      expect(output.ownerDocument).not.toBe(document);
    });
  });
});
