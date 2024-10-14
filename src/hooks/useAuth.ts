import { useMemo } from 'react';

import { SoapboxAuth, soapboxAuthSchema, AuthUser } from 'soapbox/schemas/soapbox/soapbox-auth';
import { Token } from 'soapbox/schemas/token';

import { useAppSelector } from './useAppSelector';

export function useAuth() {
  const raw = useAppSelector((state) => state.auth);

  const data = useMemo<SoapboxAuth>(() => {
    try {
      return soapboxAuthSchema.parse(raw.toJS());
    } catch {
      return { tokens: {}, users: {} };
    }
  }, [raw]);

  const users = useMemo<AuthUser[]>(() => Object.values(data.users), []);
  const tokens = useMemo<Token[]>(() => Object.values(data.tokens), []);

  const user = data.me ? data.users[data.me] : undefined;

  return {
    users,
    tokens,
    accountId: user?.id,
    accountUrl: user?.url,
    accessToken: user?.access_token,
  };
}