import z from 'zod';

const relationshipSchema = z.object({
  blocked_by: z.boolean().catch(false),
  blocking: z.boolean().catch(false),
  domain_blocking: z.boolean().catch(false),
  endorsed: z.boolean().catch(false),
  followed_by: z.boolean().catch(false),
  following: z.boolean().catch(false),
  id: z.string(),
  muting: z.boolean().catch(false),
  muting_notifications: z.boolean().catch(false),
  note: z.string().catch(''),
  notifying: z.boolean().catch(false),
  requested: z.boolean().catch(false),
  showing_reblogs: z.boolean().catch(false),
  subscribing: z.boolean().catch(false),
});

type Relationship = z.infer<typeof relationshipSchema>;

export { relationshipSchema, type Relationship };