import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchRelationshipsFail, fetchRelationshipsSuccess } from 'soapbox/actions/accounts';
import { useApi, useAppDispatch } from 'soapbox/hooks';

const useFetchRelationships = () => {
  const api = useApi();
  const dispatch = useAppDispatch();

  return useMutation(({ accountIds }: { accountIds: string[]}) => {
    const ids = accountIds.map((id) => `id[]=${id}`).join('&');

    return api.get(`/api/v1/accounts/relationships?${ids}`);
  }, {
    onSuccess(response) {
      dispatch(fetchRelationshipsSuccess(response.data));
    },
    onError(error: AxiosError) {
      dispatch(fetchRelationshipsFail(error));
    },
  });
};

export { useFetchRelationships };