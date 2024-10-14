import { z } from 'zod';

/** https://docs.joinmastodon.org/entities/WebPushSubscription/ */
const webPushSubscriptionSchema = z.object({
  id: z.coerce.string(),
  endpoint: z.string().url(),
  alerts: z.object({
    mention: z.boolean().optional(),
    status: z.boolean().optional(),
    reblog: z.boolean().optional(),
    follow: z.boolean().optional(),
    follow_request: z.boolean().optional(),
    favourite: z.boolean().optional(),
    poll: z.boolean().optional(),
    update: z.boolean().optional(),
    'admin.sign_up': z.boolean().optional(),
    'admin.report': z.boolean().optional(),
  }).optional(),
  server_key: z.string(),
});

type WebPushSubscription = z.infer<typeof webPushSubscriptionSchema>;

export { webPushSubscriptionSchema, WebPushSubscription };