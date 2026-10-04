/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/filter/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

import { normalizeFilterKeyword, type FilterKeyword } from './filter-keyword.ts';
import { normalizeFilterStatus, type FilterStatus } from './filter-status.ts';

export type ContextType = 'home' | 'public' | 'notifications' | 'thread' | 'account';
export type FilterActionType = 'warn' | 'hide';

// https://docs.joinmastodon.org/entities/filter/
export interface Filter {
  id: string;
  title: string;
  context: ContextType[];
  expires_at: string;
  filter_action: FilterActionType;
  keywords: FilterKeyword[];
  statuses: FilterStatus[];
}

const normalizeFilterV1 = (filter: Record<string, any>): Record<string, any> => ({
  ...filter,
  title: filter.phrase,
  keywords: [{
    keyword: filter.phrase,
    whole_word: filter.whole_word,
  }],
  filter_action: filter.irreversible ? 'hide' : 'warn',
});

export const normalizeFilter = (data: Record<string, any>): Filter => {
  const filter = 'phrase' in data ? normalizeFilterV1(data) : data;

  const result = fromDefaults<Filter>({
    id: '',
    title: '',
    context: [],
    expires_at: '',
    filter_action: 'warn',
    keywords: [],
    statuses: [],
  }, filter);

  result.keywords = (filter.keywords ?? []).map(normalizeFilterKeyword);
  result.statuses = (filter.statuses ?? []).map(normalizeFilterStatus);

  return result;
};
