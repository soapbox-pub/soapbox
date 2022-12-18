import type { Account } from 'soapbox/types/entities';

export const PERMISSION_CREATE_GROUPS  = 0x0000000000100000;
export const PERMISSION_INVITE_USERS   = 0x0000000000010000;
export const PERMISSION_MANAGE_USERS   = 0x0000000000000400;
export const PERMISSION_MANAGE_REPORTS = 0x0000000000000010;

type Permission = typeof PERMISSION_CREATE_GROUPS | typeof PERMISSION_INVITE_USERS | typeof PERMISSION_MANAGE_USERS | typeof PERMISSION_MANAGE_REPORTS

export const hasPermission = (account: Account | null, permission: Permission) => {
  if (!account) return false;

  const permissions = account.getIn(['role', 'permissions']) as number;

  if (!permission) return true;
  return (permissions & permission) === permission;
};
