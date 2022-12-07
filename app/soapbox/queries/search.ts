import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';

export default function useAccountSearch(q: string) {
  const api = useApi();

  const getAccountSearch = async(q: string) => {
    if (typeof q === 'undefined') {
      return null;
    }

    const { data } = await api.get('/api/v1/accounts/search', {
      params: {
        q,
        followers: true,
      },
    });

    return data;
  };

  return useQuery(['search', 'accounts', q], () => getAccountSearch(q), {
    keepPreviousData: true,
    placeholderData: [],
  });
}
