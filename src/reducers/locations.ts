import { AnyAction } from 'redux';

import { LOCATION_SEARCH_SUCCESS } from '@/actions/events.ts';
import { normalizeLocation, type Location } from '@/normalizers/location.ts';

import type { APIEntity } from '@/types/entities.ts';

type State = Record<string, Location>;

const initialState: State = {};

const normalizeLocations = (state: State, locations: APIEntity[]): State => {
  return locations.reduce(
    (state: State, location: APIEntity) => ({ ...state, [location.origin_id]: normalizeLocation(location) }),
    state,
  );
};

export default function accounts(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case LOCATION_SEARCH_SUCCESS:
      return normalizeLocations(state, action.locations);
    default:
      return state;
  }
}
