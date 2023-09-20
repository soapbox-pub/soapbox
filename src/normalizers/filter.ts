/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/filter/}
 */
import { List as ImmutableList, Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

import { FilterKeyword, FilterStatus } from 'soapbox/types/entities';

import { normalizeFilterKeyword } from './filter-keyword';
import { normalizeFilterStatus } from './filter-status';

export type ContextType = 'home' | 'public' | 'notifications' | 'thread' | 'account';
export type FilterActionType = 'warn' | 'hide';

// https://docs.joinmastodon.org/entities/filter/
export const FilterRecord = ImmutableRecord({
  id: '',
  title: '',
  context: ImmutableList<ContextType>(),
  expires_at: '',
  filter_action: 'warn' as FilterActionType,
  keywords: ImmutableList<FilterKeyword>(),
  statuses: ImmutableList<FilterStatus>(),
});

const normalizeFilterV1 = (filter: ImmutableMap<string, any>) =>
  filter
    .set('title', filter.get('phrase'))
    .set('keywords', ImmutableList([ImmutableMap({
      keyword: filter.get('phrase'),
      whole_word: filter.get('whole_word'),
    })]))
    .set('filter_action', filter.get('irreversible') ? 'hide' : 'warn');

const normalizeKeywords = (filter: ImmutableMap<string, any>) =>
  filter.update('keywords', ImmutableList(), keywords =>
    keywords.map(normalizeFilterKeyword),
  );

const normalizeStatuses = (filter: ImmutableMap<string, any>) =>
  filter.update('statuses', ImmutableList(), statuses =>
    statuses.map(normalizeFilterStatus),
  );

export const normalizeFilter = (filter: Record<string, any>) =>
  FilterRecord(
    ImmutableMap(fromJS(filter)).withMutations(filter => {
      if (filter.has('phrase')) normalizeFilterV1(filter);
      normalizeKeywords(filter);
      normalizeStatuses(filter);
    }),
  );
