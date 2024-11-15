import { z } from 'zod';

const applicationSchema = z.object({
  name: z.string().catch(''),
  website: z.string().url().nullable().catch(null),
  scopes: z.string().array().catch([]),
  redirect_uris: z.string().url().array().optional().catch(undefined),
  redirect_uri: z.string().url().optional().catch(undefined),
  client_id: z.string().optional().catch(undefined),
  client_secret: z.string().optional().catch(undefined),
  client_secret_expires_at: z.number().optional().catch(0),
}).transform((app) => {
  const { redirect_uris, redirect_uri, ...rest } = app;

  return {
    ...rest,
    redirect_uris: redirect_uris || (redirect_uri ? [redirect_uri] : []),
  };
});

type Application = z.infer<typeof applicationSchema>;

export { applicationSchema, type Application };