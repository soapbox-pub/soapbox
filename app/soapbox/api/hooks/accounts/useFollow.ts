import { Entities } from 'soapbox/entity-store/entities';
import { useChangeEntity } from 'soapbox/entity-store/hooks';
import { useLoggedIn } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account } from 'soapbox/schemas';

function useChangeAccount() {
  const { changeEntity: changeAccount } = useChangeEntity<Account>(Entities.ACCOUNTS);
  return { changeAccount };
}

interface FollowOpts {
  reblogs?: boolean
  notify?: boolean
  languages?: string[]
}

function useFollow() {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();
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

  async function follow(accountId: string, options: FollowOpts = {}) {
    if (!isLoggedIn) return;
    incrementFollowers(accountId);

    try {
      await api.post(`/api/v1/accounts/${accountId}/follow`, options);
    } catch (e) {
      decrementFollowers(accountId);
    }
  }

  async function unfollow(accountId: string) {
    if (!isLoggedIn) return;
    decrementFollowers(accountId);

    try {
      await api.post(`/api/v1/accounts/${accountId}/unfollow`);
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