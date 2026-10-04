import { normalizeFilter } from '@/normalizers/index.ts';

import { FILTERS_FETCH_SUCCESS } from '../actions/filters.ts';

import type { APIEntity, Filter as FilterEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type State = FilterEntity[];

const importFilters = (_state: State, filters: APIEntity[]): State =>
  filters.map((filter) => normalizeFilter(filter));

export default function filters(state: State = [], action: AnyAction): State {
  switch (action.type) {
    case FILTERS_FETCH_SUCCESS:
      return importFilters(state, action.filters);
    default:
      return state;
  }
}
