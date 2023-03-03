import { List as ImmutableList } from 'immutable';

import { normalizeFilterV1 } from 'soapbox/normalizers';

import { FILTERS_V1_FETCH_SUCCESS } from '../actions/filters';

import type { AnyAction } from 'redux';
import type { APIEntity, FilterV1 as FilterV1Entity } from 'soapbox/types/entities';

type State = ImmutableList<FilterV1Entity>;

const importFiltersV1 = (_state: State, filters: APIEntity[]): State => {
  return ImmutableList(filters.map((filter) => normalizeFilterV1(filter)));
};

export default function filters(state: State = ImmutableList(), action: AnyAction): State {
  switch (action.type) {
    case FILTERS_V1_FETCH_SUCCESS:
      return importFiltersV1(state, action.filters);
    default:
      return state;
  }
}
