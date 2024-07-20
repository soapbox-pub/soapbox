import { camelCase, mapKeys } from 'lodash';
import z from 'zod';

const relaySchema = z.preprocess((data: any) => {
  return { id: data.actor, ...data };
}, z.object({
  actor: z.string().catch(''),
  id: z.string(),
  followed_back: z.boolean().catch(false),
}));

const relayLookupResultSchema = z.record(z.string(), z.number().or(z.boolean()).or(z.string()))
  .transform(x => mapKeys(x, (_, k) => camelCase(k)))
  .pipe(z.object({
    gotKind0: z.boolean().catch(false),
    gotKind3: z.boolean().catch(false),
    notesCount: z.number().catch(0),
  }));

type Relay = z.infer<typeof relaySchema>

export { relaySchema, relayLookupResultSchema, type Relay };
