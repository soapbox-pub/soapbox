import { NSchema as n } from '@nostrify/nostrify';
import { z } from 'zod';

const baseWalletSchema = z.object({
  pubkey_p2pk: n.id(),
  mints: z.array(z.string()),
  // .nonempty()
  relays: z.array(z.string().url()).nonempty(),
  balance: z.number(),
});

type WalletData = z.infer<typeof baseWalletSchema>;

export { baseWalletSchema, type WalletData };