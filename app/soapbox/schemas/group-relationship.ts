import z from 'zod';

import { GroupRoles } from './group-member';

const groupRelationshipSchema = z.object({
  blocked_by: z.boolean().catch(false),
  id: z.string(),
  member: z.boolean().catch(false),
  muting: z.boolean().nullable().catch(false),
  notifying: z.boolean().nullable().catch(null),
  pending_requests: z.boolean().catch(false),
  requested: z.boolean().catch(false),
  role: z.nativeEnum(GroupRoles).catch(GroupRoles.USER),
});

type GroupRelationship = z.infer<typeof groupRelationshipSchema>;

export { groupRelationshipSchema, type GroupRelationship };