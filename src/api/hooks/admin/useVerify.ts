import { useTransaction } from 'soapbox/entity-store/hooks/index.ts';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';
import { accountIdsToAccts } from 'soapbox/selectors/index.ts';

import type { Account } from 'soapbox/schemas/index.ts';

function useVerify() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  function verifyEffect(accountIds: string[], verified: boolean) {
    const updater = (account: Account): Account => {
      if (account.pleroma) {
        const tags = account.pleroma.tags.filter((tag) => tag !== 'verified');
        if (verified) {
          tags.push('verified');
        }
        account.pleroma.tags = tags;
      }
      account.verified = verified;
      return account;
    };

    transaction({
      Accounts: accountIds.reduce<Record<string, (account: Account) => Account>>(
        (result, id) => ({ ...result, [id]: updater }),
      {}),
    });
  }

  async function verify(accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) {
    const accts = accountIdsToAccts(getState(), accountIds);
    verifyEffect(accountIds, true);
    try {
      await api.put('/api/v1/pleroma/admin/users/tag', { nicknames: accts, tags: ['verified'] });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accountIds, false);
    }
  }

  async function unverify(accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) {
    const accts = accountIdsToAccts(getState(), accountIds);
    verifyEffect(accountIds, false);
    try {
      await api.request('DELETE', '/api/v1/pleroma/admin/users/tag', { nicknames: accts, tags: ['verified'] });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accountIds, true);
    }
  }

  return {
    verify,
    unverify,
  };
}

export { useVerify };