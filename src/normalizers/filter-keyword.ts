/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/FilterKeyword/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

// https://docs.joinmastodon.org/entities/FilterKeyword/
export interface FilterKeyword {
  id: string;
  keyword: string;
  whole_word: boolean;
}

export const normalizeFilterKeyword = (filterKeyword: Record<string, any>): FilterKeyword =>
  fromDefaults<FilterKeyword>({
    id: '',
    keyword: '',
    whole_word: false,
  }, filterKeyword);
