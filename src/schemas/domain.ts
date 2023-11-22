import z from 'zod';

const domainSchema = z.object({
  domain: z.string().catch(''),
  id: z.coerce.string(),
  public: z.boolean().catch(false),
  resolves: z.boolean().catch(false),
  last_checked_at: z.string().datetime().catch(''),
});

type Domain = z.infer<typeof domainSchema>

export { domainSchema, type Domain };
