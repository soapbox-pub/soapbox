import { z } from 'zod';

import { coerceObject } from './utils';

const mrfSimpleSchema = coerceObject({
  accept: z.string().array().catch([]),
  avatar_removal: z.string().array().catch([]),
  banner_removal: z.string().array().catch([]),
  federated_timeline_removal: z.string().array().catch([]),
  followers_only: z.string().array().catch([]),
  media_nsfw: z.string().array().catch([]),
  media_removal: z.string().array().catch([]),
  reject: z.string().array().catch([]),
  reject_deletes: z.string().array().catch([]),
  report_removal: z.string().array().catch([]),
});

type MRFSimple = z.infer<typeof mrfSimpleSchema>;

export { mrfSimpleSchema, type MRFSimple };