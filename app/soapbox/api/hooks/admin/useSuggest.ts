import { Entities } from 'soapbox/entity-store/entities';
import { useTransaction } from 'soapbox/entity-store/hooks';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types';
import { findEntity } from 'soapbox/entity-store/selectors';
import { useApi, useGetState } from 'soapbox/hooks';

import type { Account } from 'soapbox/schemas';
import type { RootState } from 'soapbox/store';

function useSuggest() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  function suggestEffect(accts: string[], suggested: boolean) {
    const ids = selectIdsForAccts(getState(), accts);

    const updater = (account: Account): Account => {
      if (account.pleroma) {
        account.pleroma.is_suggested = suggested;
      }
      return account;
    };

    transaction({
      Accounts: ids.reduce<Record<string, (account: Account) => Account>>(
        (result, id) => ({ ...result, [id]: updater }),
      {}),
    });
  }

  async function suggest(accts: string[], callbacks?: EntityCallbacks<void, unknown>) {
    suggestEffect(accts, true);
    try {
      await api.patch('/api/v1/pleroma/admin/users/suggest', { nicknames: accts });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accts, false);
    }
  }

  async function unsuggest(accts: string[], callbacks?: EntityCallbacks<void, unknown>) {
    suggestEffect(accts, false);
    try {
      await api.patch('/api/v1/pleroma/admin/users/unsuggest', { nicknames: accts });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accts, true);
    }
  }

  return {
    suggest,
    unsuggest,
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

export { useSuggest };