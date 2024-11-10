import { Map as ImmutableMap } from 'immutable';
import { AnyAction } from 'redux';

import { LOCATION_SEARCH_SUCCESS } from 'soapbox/actions/events.ts';
import { normalizeLocation } from 'soapbox/normalizers/location.ts';

import type { APIEntity } from 'soapbox/types/entities.ts';

type LocationRecord = ReturnType<typeof normalizeLocation>;
type State = ImmutableMap<any, LocationRecord>;

const initialState: State = ImmutableMap();

const normalizeLocations = (state: State, locations: APIEntity[]) => {
  return locations.reduce(
    (state: State, location: APIEntity) => state.set(location.origin_id, normalizeLocation(location)),
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
