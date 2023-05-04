import { z } from 'zod';

import { normalizeChatMessage } from 'soapbox/normalizers';
import { toSchema } from 'soapbox/utils/normalizers';

const chatMessageSchema = toSchema(normalizeChatMessage);

type ChatMessage = z.infer<typeof chatMessageSchema>;

export { chatMessageSchema, type ChatMessage };