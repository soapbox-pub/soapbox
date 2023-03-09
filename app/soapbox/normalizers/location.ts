import { Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

export const GeographicLocationRecord = ImmutableRecord({
  coordinates: null as [number, number] | null,
  srid: '',
});

export const LocationRecord = ImmutableRecord({
  url: '',
  description: '',
  country: '',
  locality: '',
  region: '',
  postal_code: '',
  street: '',
  origin_id: '',
  origin_provider: '',
  type: '',
  timezone: '',
  geom: null as ReturnType<typeof GeographicLocationRecord> | null,
});

const normalizeGeographicLocation = (location: ImmutableMap<string, any>) => {
  if (location.get('geom')) {
    return location.set('geom', GeographicLocationRecord(location.get('geom')));
  }

  return location;
};

export const normalizeLocation = (location: Record<string, any>) => {
  return LocationRecord(ImmutableMap(fromJS(location)).withMutations((location: ImmutableMap<string, any>) => {
    normalizeGeographicLocation(location);
  }));
};
