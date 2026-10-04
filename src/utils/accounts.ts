import avatarMissing from '@/assets/images/avatar-missing.png';
import headerMissing from '@/assets/images/header-missing.png';

import type { Account } from '@/schemas/index.ts';

const getDomainFromURL = (account: Pick<Account, 'url'>): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

export const getDomain = (account: Pick<Account, 'acct' | 'url'>): string => {
  const domain = account.acct.split('@')[1];
  return domain ? domain : getDomainFromURL(account);
};

/** Guess the fully-qualified acct of an API entity that may not provide one. */
export const guessFqn = (entity: { acct?: string; fqn?: string; url?: string }): string => {
  if (entity.fqn) return entity.fqn;

  const acct = entity.acct ?? '';
  const [user, domain] = acct.split('@');

  if (domain) {
    return acct;
  } else {
    return [user, getDomainFromURL({ url: entity.url ?? '' })].join('@');
  }
};

export const getBaseURL = (account: Pick<Account, 'url'>): string => {
  try {
    return new URL(account.url).origin;
  } catch {
    return '';
  }
};

export const getAcct = (account: Pick<Account, 'fqn' | 'acct'>, displayFqn: boolean): string => (
  displayFqn === true ? account.fqn : account.acct
);

/** Default header filenames from various backends */
const DEFAULT_HEADERS: string[] = [
  '/headers/original/missing.png', // Mastodon
  '/images/banner.png', // Pleroma
  headerMissing, // header not provided by backend
];

/** Check if the avatar is a default avatar */
export const isDefaultHeader = (url: string) => {
  return DEFAULT_HEADERS.some(header => url.endsWith(header));
};

/** Default avatar filenames from various backends */
const DEFAULT_AVATARS = [
  '/avatars/original/missing.png', // Mastodon
  '/images/avi.png', // Pleroma
  avatarMissing, // avatar not provided by backend
];

/** Check if the avatar is a default avatar */
export const isDefaultAvatar = (url: string) => {
  return DEFAULT_AVATARS.some(avatar => url.endsWith(avatar));
};
