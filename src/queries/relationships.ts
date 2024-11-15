import { useMutation } from '@tanstack/react-query';

import { fetchRelationshipsFail, fetchRelationshipsSuccess } from 'soapbox/actions/accounts.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

const useFetchRelationships = () => {
  const api = useApi();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ accountIds }: { accountIds: string[]}) => {
      const ids = accountIds.map((id) => `id[]=${id}`).join('&');

      return api.get(`/api/v1/accounts/relationships?${ids}`);
    },
    async onSuccess(response) {
      dispatch(fetchRelationshipsSuccess(await response.json()));
    },
    onError(error) {
      dispatch(fetchRelationshipsFail(error));
    },
  });
};

export { useFetchRelationships };