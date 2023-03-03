/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/V1_Filter/}
 */
import { List as ImmutableList, Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

import type { ContextType } from './filter';

// https://docs.joinmastodon.org/entities/V1_Filter/
export const FilterV1Record = ImmutableRecord({
  id: '',
  phrase: '',
  context: ImmutableList<ContextType>(),
  whole_word: false,
  expires_at: '',
  irreversible: false,
});

export const normalizeFilterV1 = (filter: Record<string, any>) => {
  return FilterV1Record(
    ImmutableMap(fromJS(filter)),
  );
};
