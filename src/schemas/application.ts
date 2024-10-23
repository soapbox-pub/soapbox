import { z } from 'zod';

const applicationSchema = z.object({
  name: z.string(),
  website: z.string().url().nullable().catch(null),
  scopes: z.string().array().catch([]),
  redirect_uris: z.string().url().array().optional().catch(undefined),
  redirect_uri: z.string().url().optional().catch(undefined),
}).transform((app) => {
  const { name, website, scopes, redirect_uris, redirect_uri } = app;

  return {
    name,
    website,
    scopes,
    redirect_uris: redirect_uris || (redirect_uri ? [redirect_uri] : []),
  };
});

type Application = z.infer<typeof applicationSchema>;

export { applicationSchema, Application };