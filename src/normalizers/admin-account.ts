/**
 * Admin account normalizer:
 * Converts API admin-level account information into our internal format.
 */
import { fromDefaults } from '@/utils/normalizers.ts';

import type { Account, EmbeddedEntity } from '@/types/entities.ts';

export interface AdminAccount {
  account: EmbeddedEntity<Account>;
  approved: boolean;
  confirmed: boolean;
  created_at: Date | string;
  disabled: boolean;
  domain: string;
  email: string;
  id: string;
  invite_request: string | null;
  ip: string | null;
  ips: string[];
  locale: string | null;
  role: 'admin' | 'moderator' | null;
  sensitized: boolean;
  silenced: boolean;
  suspended: boolean;
  username: string;
}

const normalizePleromaAccount = (account: Record<string, any>): Record<string, any> => {
  if (!account.account) {
    const isAdmin = account.roles?.admin;
    const isModerator = account.roles?.moderator ? 'moderator' : null;

    const accountRole = isAdmin ? 'admin' : isModerator;

    return {
      ...account,
      approved: account.is_approved,
      confirmed: account.is_confirmed,
      disabled: !account.is_active,
      invite_request: account.registration_reason,
      role: accountRole,
    };
  }

  return account;
};

export const normalizeAdminAccount = (account: Record<string, any>): AdminAccount => {
  return fromDefaults<AdminAccount>({
    account: null,
    approved: false,
    confirmed: false,
    created_at: new Date(),
    disabled: false,
    domain: '',
    email: '',
    id: '',
    invite_request: null,
    ip: null,
    ips: [],
    locale: null,
    role: null,
    sensitized: false,
    silenced: false,
    suspended: false,
    username: '',
  }, normalizePleromaAccount(account));
};
