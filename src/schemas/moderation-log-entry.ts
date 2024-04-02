import z from 'zod';

const moderationLogEntrySchema = z.object({
  id: z.coerce.string(),
  data: z.record(z.string(), z.any()).catch({}),
  time: z.number().catch(0),
  message: z.string().catch(''),
});

type ModerationLogEntry = z.infer<typeof moderationLogEntrySchema>

export { moderationLogEntrySchema, type ModerationLogEntry };
