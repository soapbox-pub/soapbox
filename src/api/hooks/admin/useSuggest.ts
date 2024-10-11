import { useTransaction } from 'soapbox/entity-store/hooks';
import { EntityCallbacks } from 'soapbox/entity-store/hooks/types';
import { useApi, useGetState } from 'soapbox/hooks';
import { accountIdsToAccts } from 'soapbox/selectors';

import type { Account } from 'soapbox/schemas';

function useSuggest() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  function suggestEffect(accountIds: string[], suggested: boolean) {
    const updater = (account: Account): Account => {
      if (account.pleroma) {
        account.pleroma.is_suggested = suggested;
      }
      return account;
    };

    transaction({
      Accounts: accountIds.reduce<Record<string, (account: Account) => Account>>(
        (result, id) => ({ ...result, [id]: updater }),
      {}),
    });
  }

  async function suggest(accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) {
    const accts = accountIdsToAccts(getState(), accountIds);
    suggestEffect(accountIds, true);
    try {
      await api.patch('/api/v1/pleroma/admin/users/suggest', { nicknames: accts });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accountIds, false);
    }
  }

  async function unsuggest(accountIds: string[], callbacks?: EntityCallbacks<void, unknown>) {
    const accts = accountIdsToAccts(getState(), accountIds);
    suggestEffect(accountIds, false);
    try {
      await api.patch('/api/v1/pleroma/admin/users/unsuggest', { nicknames: accts });
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accountIds, true);
    }
  }

  return {
    suggest,
    unsuggest,
  };
}

export { useSuggest };