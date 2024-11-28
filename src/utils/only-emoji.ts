import graphemesplit from 'graphemesplit';

import { CustomEmoji } from 'soapbox/schemas/custom-emoji.ts';
import { htmlToPlaintext } from 'soapbox/utils/html.ts';

/** Given the HTML string, determine whether the plaintext contains only emojis (native or custom), not exceeding the max. */
export function isOnlyEmoji(html: string, emojis: CustomEmoji[], max: number): boolean {
  let plain = htmlToPlaintext(html).replaceAll(/\s/g, '');

  const native = graphemesplit(plain).filter((char) => /^\p{Extended_Pictographic}+$/u.test(char));
  const custom = [...plain.matchAll(/:(\w+):/g)].map(([, shortcode]) => shortcode).filter((shortcode) => emojis.some((emoji) => emoji.shortcode === shortcode));

  for (const emoji of native) {
    plain = plain.replaceAll(emoji, '');
  }
  for (const shortcode of custom) {
    plain = plain.replaceAll(`:${shortcode}:`, '');
  }

  return plain.length === 0 && native.length + custom.length <= max;
}