import { NSchema as n } from '@nostrify/nostrify';
import { z } from 'zod';

const baseWalletSchema = z.object({
  pubkey_p2pk: n.id(),
  mints: z.array(z.string().url()).nonempty(),
  relays: z.array(z.string()).nonempty(),
  balance: z.number(),
});

const quoteShema = z.object({
  expiry: z.number(),
  paid: z.boolean(),
  quote: z.string(),
  request: z.string(),
  state: z.enum(['UNPAID', 'PAID', 'ISSUED']),
});

type Quote = z.infer<typeof quoteShema>

type WalletData = z.infer<typeof baseWalletSchema>;

export { baseWalletSchema, quoteShema, type WalletData, type Quote };