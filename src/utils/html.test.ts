import { describe, expect, it } from 'vitest';

import * as html from './html.ts';

describe('html', () => {
  describe('htmlToPlaintext', () => {
    it('converts html to plaintext, preserving linebreaks', () => {
      const output = html.htmlToPlaintext('<p>lorem</p><p>ipsum</p><br>&lt;br&gt;');
      expect(output).toEqual('lorem\n\nipsum\n<br>');
    });
  });
});
