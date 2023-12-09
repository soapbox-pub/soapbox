import z from 'zod';

const domainSchema = z.object({
  id: z.coerce.string(),
  domain: z.string().catch(''),
  service_domain: z.string().catch(''),
  public: z.boolean().catch(false),
  resolves: z.boolean().catch(false),
  last_checked_at: z.string().datetime().catch(''),
});

type Domain = z.infer<typeof domainSchema>

export { domainSchema, type Domain };
