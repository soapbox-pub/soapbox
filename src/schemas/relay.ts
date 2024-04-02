import z from 'zod';

const relaySchema = z.preprocess((data: any) => {
  return { id: data.actor, ...data };
}, z.object({
  actor: z.string().catch(''),
  id: z.string(),
  followed_back: z.boolean().catch(false),
}));

type Relay = z.infer<typeof relaySchema>

export { relaySchema, type Relay };
