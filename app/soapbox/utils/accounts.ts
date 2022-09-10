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
