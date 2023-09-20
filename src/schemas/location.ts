import { z } from 'zod';

const locationSchema = z.object({
  url: z.string().url().catch(''),
  description: z.string().catch(''),
  country: z.string().catch(''),
  locality: z.string().catch(''),
  region: z.string().catch(''),
  postal_code: z.string().catch(''),
  street: z.string().catch(''),
  origin_id: z.string().catch(''),
  origin_provider: z.string().catch(''),
  type: z.string().catch(''),
  timezone: z.string().catch(''),
  name: z.string().catch(''),
  latitude: z.number().catch(0),
  longitude: z.number().catch(0),
  geom: z.object({
    coordinates: z.tuple([z.number(), z.number()]).nullable().catch(null),
    srid: z.string().catch(''),
  }).nullable().catch(null),
});

type Location = z.infer<typeof locationSchema>;

export { locationSchema, type Location };