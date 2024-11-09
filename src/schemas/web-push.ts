import { z } from 'zod';

import { coerceObject } from './utils';

/** https://docs.joinmastodon.org/entities/WebPushSubscription/ */
const webPushSubscriptionSchema = z.object({
  id: z.coerce.string(),
  endpoint: z.string().url(),
  alerts: coerceObject({
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
  }),
  server_key: z.string(),
});

type WebPushSubscription = z.infer<typeof webPushSubscriptionSchema>;

export { webPushSubscriptionSchema, type WebPushSubscription };