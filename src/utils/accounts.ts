import type { Account } from 'soapbox/schemas';

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

export const isLocal = (account: Pick<Account, 'acct'>): boolean => {
  const domain: string = account.acct.split('@')[1];
  return domain === undefined ? true : false;
};

export const isRemote = (account: Pick<Account, 'acct'>): boolean => !isLocal(account);

/** Default header filenames from various backends */
const DEFAULT_HEADERS: string[] = [
  '/headers/original/missing.png', // Mastodon
  '/images/banner.png', // Pleroma
  require('assets/images/header-missing.png'), // header not provided by backend
];

/** Check if the avatar is a default avatar */
export const isDefaultHeader = (url: string) => {
  return DEFAULT_HEADERS.some(header => url.endsWith(header));
};

/** Default avatar filenames from various backends */
const DEFAULT_AVATARS = [
  '/avatars/original/missing.png', // Mastodon
  '/images/avi.png', // Pleroma
  require('assets/images/avatar-missing.png'), // avatar not provided by backend
];

/** Check if the avatar is a default avatar */
export const isDefaultAvatar = (url: string) => {
  return DEFAULT_AVATARS.some(avatar => url.endsWith(avatar));
};
