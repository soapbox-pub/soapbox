import { Entities } from 'soapbox/entity-store/entities';
import { useTransaction } from 'soapbox/entity-store/hooks';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types';
import { findEntity } from 'soapbox/entity-store/selectors';
import { useApi, useGetState } from 'soapbox/hooks';

import type { Account } from 'soapbox/schemas';
import type { RootState } from 'soapbox/store';

function useVerify() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  function verifyEffect(accts: string[], verified: boolean) {
    const ids = selectIdsForAccts(getState(), accts);

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
      Accounts: ids.reduce<Record<string, (account: Account) => Account>>(
        (result, id) => ({ ...result, [id]: updater }),
      {}),
    });
  }

  async function verify(accts: string[], callbacks?: EntityCallbacks<void, unknown>) {
    verifyEffect(accts, true);
    try {
      await api.put('/api/v1/pleroma/admin/users/tag', { nicknames: accts, tags: ['verified'] });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accts, false);
    }
  }

  async function unverify(accts: string[], callbacks?: EntityCallbacks<void, unknown>) {
    verifyEffect(accts, false);
    try {
      await api.delete('/api/v1/pleroma/admin/users/tag', { data: { nicknames: accts, tags: ['verified'] } });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accts, true);
    }
  }

  return {
    verify,
    unverify,
  };
}

function selectIdsForAccts(state: RootState, accts: string[]): string[] {
  return accts.map((acct) => {
    const account = findEntity<Account>(
      state,
      Entities.ACCOUNTS,
      (account) => account.acct === acct,
    );
    return account!.id;
  });
}

export { useVerify };