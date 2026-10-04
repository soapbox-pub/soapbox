/**
 * Emoji normalizer:
 * Converts API emojis into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/emoji/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

// https://docs.joinmastodon.org/entities/emoji/
export interface Emoji {
  category: string;
  shortcode: string;
  static_url: string;
  url: string;
  visible_in_picker: boolean;
}

export const normalizeEmoji = (emoji: Record<string, any>): Emoji => {
  return fromDefaults<Emoji>({
    category: '',
    shortcode: '',
    static_url: '',
    url: '',
    visible_in_picker: true,
  }, emoji);
};
