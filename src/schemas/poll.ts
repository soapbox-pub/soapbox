import { z } from 'zod';

import { customEmojiSchema } from './custom-emoji.ts';
import { filteredArray } from './utils.ts';

const pollOptionSchema = z.object({
  title: z.string().catch(''),
  votes_count: z.number().catch(0),
});

const pollSchema = z.object({
  emojis: filteredArray(customEmojiSchema),
  expired: z.boolean().catch(false),
  expires_at: z.string().datetime().nullable().catch(null),
  id: z.string(),
  multiple: z.boolean().catch(false),
  options: z.array(pollOptionSchema).min(2),
  voters_count: z.number().catch(0),
  votes_count: z.number().catch(0),
  own_votes: z.array(z.number()).nonempty().nullable().catch(null),
  voted: z.boolean().catch(false),
  pleroma: z.object({
    non_anonymous: z.boolean().catch(false),
  }).optional().catch(undefined),
}).transform((poll) => {
  // If the user has votes, they have certainly voted.
  if (poll.own_votes?.length) {
    poll.voted = true;
  }

  return poll;
});

type Poll = z.infer<typeof pollSchema>;
type PollOption = Poll['options'][number];

export { pollSchema, type Poll, type PollOption };