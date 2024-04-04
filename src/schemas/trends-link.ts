import { z } from 'zod';

import { blurhashSchema } from './attachment';
import { historySchema } from './tag';

/** https://docs.joinmastodon.org/entities/PreviewCard/#trends-link */
const trendsLinkSchema = z.preprocess((link: any) => {
  return { ...link, id: link.url };
}, z.object({
  id: z.string().catch(''),
  url: z.string().url().catch(''),
  title: z.string().catch(''),
  description: z.string().catch(''),
  type: z.enum(['link', 'photo', 'video', 'rich']).catch('link'),
  author_name: z.string().catch(''),
  author_url: z.string().catch(''),
  provider_name: z.string().catch(''),
  provider_url: z.string().catch(''),
  html: z.string().catch(''),
  width: z.number().nullable().catch(null),
  height: z.number().nullable().catch(null),
  image: z.string().nullable().catch(null),
  image_description: z.string().nullable().catch(null),
  embed_url: z.string().catch(''),
  blurhash: blurhashSchema.nullable().catch(null),
  history: z.array(historySchema).nullable().catch(null),
}));

type TrendsLink = z.infer<typeof trendsLinkSchema>;

export { trendsLinkSchema, type TrendsLink };
