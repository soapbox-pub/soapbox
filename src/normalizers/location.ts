import { fromDefaults } from '@/utils/normalizers.ts';

export interface GeographicLocation {
  coordinates: [number, number] | null;
  srid: string;
}

export interface Location {
  url: string;
  description: string;
  country: string;
  locality: string;
  region: string;
  postal_code: string;
  street: string;
  origin_id: string;
  origin_provider: string;
  type: string;
  timezone: string;
  geom: GeographicLocation | null;
}

export const normalizeLocation = (location: Record<string, any>): Location => {
  const result = fromDefaults<Location>({
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
    geom: null,
  }, location);

  if (location.geom) {
    result.geom = fromDefaults<GeographicLocation>({
      coordinates: null,
      srid: '',
    }, location.geom);
  }

  return result;
};
