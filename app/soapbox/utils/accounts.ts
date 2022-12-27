import type { Account } from 'soapbox/types/entities';

const getDomainFromURL = (account: Account): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

export const getDomain = (account: Account): string => {
  const domain = account.acct.split('@')[1];
  return domain ? domain : getDomainFromURL(account);
};

export const getBaseURL = (account: Account): string => {
  try {
    return new URL(account.url).origin;
  } catch {
    return '';
  }
};

export const getAcct = (account: Account, displayFqn: boolean): string => (
  displayFqn === true ? account.fqn : account.acct
);

export const isLocal = (account: Account): boolean => {
  const domain: string = account.acct.split('@')[1];
  return domain === undefined ? true : false;
};

export const isRemote = (account: Account): boolean => !isLocal(account);

/** Default header filenames from various backends */
const DEFAULT_HEADERS = [
  '/headers/original/missing.png', // Mastodon
  '/images/banner.png', // Pleroma
];

/** Check if the avatar is a default avatar */
export const isDefaultHeader = (url: string) => {
  return DEFAULT_HEADERS.some(header => url.endsWith(header));
};

/** Default avatar filenames from various backends */
const DEFAULT_AVATARS = [
  '/avatars/original/missing.png', // Mastodon
  '/images/avi.png', // Pleroma
];

/** Check if the avatar is a default avatar */
export const isDefaultAvatar = (url: string) => {
  return DEFAULT_AVATARS.some(avatar => url.endsWith(avatar));
};
