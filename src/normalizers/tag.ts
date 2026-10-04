/**
 * Tag normalizer:
 * Converts API tags into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/tag/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

import { normalizeHistory, type History } from './history.ts';

// https://docs.joinmastodon.org/entities/tag/
export interface Tag {
  name: string;
  url: string;
  history: History[] | null;
  following: boolean;
}

export const normalizeTag = (tag: Record<string, any>): Tag => {
  const result = fromDefaults<Tag>({
    name: '',
    url: '',
    history: null,
    following: false,
  }, tag);

  result.history = Array.isArray(tag.history) ? tag.history.map(normalizeHistory) : null;

  return result;
};
