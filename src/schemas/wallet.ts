import { NSchema as n } from '@nostrify/nostrify';
import { z } from 'zod';

import { accountSchema } from 'soapbox/schemas/account.ts';

const baseWalletSchema = z.object({
  pubkey_p2pk: n.id(),
  mints: z.array(z.string().url()).nonempty(),
  relays: z.array(z.string()).nonempty(),
  balance: z.number(),
});

const quoteSchema = z.object({
  expiry: z.number(),
  paid: z.boolean(),
  quote: z.string(),
  request: z.string(),
  state: z.enum(['UNPAID', 'PAID', 'ISSUED']),
});

const transactionSchema = z.object({
  amount: z.number(),
  created_at: z.number(),
  direction: z.enum(['in', 'out']),
});


const nutzappedEntry = z.array(
  z.object({
    comment: z.string(),
    amount: z.number(),
    account: accountSchema,
  }),
);

const nutzappedRecord = z.record(
  z.string(),
  nutzappedEntry,
);

const transactionsSchema = z.array(transactionSchema);

type NutzappedEntry = z.infer<typeof nutzappedEntry>

type NutzappedRecord = z.infer<typeof nutzappedRecord>

type Transactions = z.infer<typeof transactionsSchema>

type Quote = z.infer<typeof quoteSchema>

type WalletData = z.infer<typeof baseWalletSchema>;

export { baseWalletSchema, quoteSchema, transactionsSchema, nutzappedRecord, nutzappedEntry, type WalletData, type Quote, type Transactions, type NutzappedRecord, type NutzappedEntry };