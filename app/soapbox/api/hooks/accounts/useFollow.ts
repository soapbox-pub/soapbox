import { Entities } from 'soapbox/entity-store/entities';
import { useChangeEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account } from 'soapbox/schemas';

function useChangeAccount() {
  const { changeEntity: changeAccount } = useChangeEntity<Account>(Entities.ACCOUNTS);
  return { changeAccount };
}

function useFollow() {
  const api = useApi();
  const { changeAccount } = useChangeAccount();

  function incrementFollowers(accountId: string) {
    changeAccount(accountId, (account) => ({
      ...account,
      followers_count: account.followers_count + 1,
    }));
  }

  function decrementFollowers(accountId: string) {
    changeAccount(accountId, (account) => ({
      ...account,
      followers_count: account.followers_count - 1,
    }));
  }

  async function follow(accountId: string, options = {}) {
    incrementFollowers(accountId);

    try {
      await api.post(`/api/v1/accounts/${accountId}/follow`, options);
    } catch (e) {
      decrementFollowers(accountId);
    }
  }

  async function unfollow(accountId: string, options = {}) {
    decrementFollowers(accountId);

    try {
      await api.post(`/api/v1/accounts/${accountId}/unfollow`, options);
    } catch (e) {
      incrementFollowers(accountId);
    }
  }

  return {
    follow,
    unfollow,
    incrementFollowers,
    decrementFollowers,
  };
}

export { useFollow };