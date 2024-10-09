import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useTransaction } from 'soapbox/entity-store/hooks';
import { useApi, useAppDispatch, useLoggedIn } from 'soapbox/hooks';
import { relationshipSchema } from 'soapbox/schemas';

interface FollowOpts {
  reblogs?: boolean;
  notify?: boolean;
  languages?: string[];
}

function useFollow() {
  const api = useApi();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useLoggedIn();
  const { transaction } = useTransaction();

  function followEffect(accountId: string) {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: account.followers_count + 1,
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: true,
        }),
      },
    });
  }

  function unfollowEffect(accountId: string) {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: Math.max(0, account.followers_count - 1),
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: false,
        }),
      },
    });
  }

  async function follow(accountId: string, options: FollowOpts = {}) {
    if (!isLoggedIn) return;
    followEffect(accountId);

    try {
      const response = await api.post(`/api/v1/accounts/${accountId}/follow`, { json: options });
      const result = relationshipSchema.safeParse(await response.json());
      if (result.success) {
        dispatch(importEntities([result.data], Entities.RELATIONSHIPS));
      }
    } catch (e) {
      unfollowEffect(accountId);
    }
  }

  async function unfollow(accountId: string) {
    if (!isLoggedIn) return;
    unfollowEffect(accountId);

    try {
      await api.post(`/api/v1/accounts/${accountId}/unfollow`);
    } catch (e) {
      followEffect(accountId);
    }
  }

  return {
    follow,
    unfollow,
    followEffect,
    unfollowEffect,
  };
}

export { useFollow };