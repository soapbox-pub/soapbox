/**
 * Admin account normalizer:
 * Converts API admin-level account information into our internal format.
 */
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import type { Account, EmbeddedEntity } from 'soapbox/types/entities';

export const AdminAccountRecord = ImmutableRecord({
  account: null as EmbeddedEntity<Account>,
  approved: false,
  confirmed: false,
  created_at: new Date(),
  disabled: false,
  domain: '',
  email: '',
  id: '',
  invite_request: null as string | null,
  ip: null as string | null,
  ips: ImmutableList<string>(),
  locale: null as string | null,
  role: null as 'admin' | 'moderator' | null,
  sensitized: false,
  silenced: false,
  suspended: false,
  username: '',
});

const normalizePleromaAccount = (account: ImmutableMap<string, any>) => {
  if (!account.get('account')) {

    const isAdmin = account.getIn(['roles', 'admin']);
    const isModerator = account.getIn(['roles', 'moderator']) ? 'moderator' : null;

    const accountRole = isAdmin ? 'admin' : isModerator;

    return account.withMutations(account => {
      account.set('approved', account.get('is_approved'));
      account.set('confirmed', account.get('is_confirmed'));
      account.set('disabled', !account.get('is_active'));
      account.set('invite_request', account.get('registration_reason'));
      account.set('role', accountRole);
    });
  }

  return account;
};

export const normalizeAdminAccount = (account: Record<string, any>) => {
  return AdminAccountRecord(
    ImmutableMap(fromJS(account)).withMutations((account: ImmutableMap<string, any>) => {
      normalizePleromaAccount(account);
    }),
  );
};
