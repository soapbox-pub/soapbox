/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/FilterResult/}
 */
import { List as ImmutableList, Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

import { normalizeFilter } from './filter';

import type { Filter } from 'soapbox/types/entities';

// https://docs.joinmastodon.org/entities/FilterResult/
export const FilterResultRecord = ImmutableRecord({
  filter: null as Filter | null,
  keyword_matches: ImmutableList<string>(),
  status_matches: ImmutableList<string>(),
});

export const normalizeFilterResult = (filterResult: Record<string, any>) =>
  FilterResultRecord(
    ImmutableMap(fromJS(filterResult)).update('filter', (filter: any) => normalizeFilter(filter) as any),
  );
