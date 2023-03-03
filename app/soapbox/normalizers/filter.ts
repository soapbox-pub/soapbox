/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/filter/}
 */
import { List as ImmutableList, Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

import { FilterKeyword, FilterStatus } from 'soapbox/types/entities';

import { normalizeFilterKeyword } from './filter-keyword';
import { normalizeFilterStatus } from './filter-status';

export type ContextType = 'home' | 'public' | 'notifications' | 'thread';
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
      normalizeKeywords(filter);
      normalizeStatuses(filter);
    }),
  );
