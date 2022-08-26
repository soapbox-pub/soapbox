import { useQuery } from '@tanstack/react-query';

import { Ad, getProvider } from 'soapbox/features/ads/providers';
import { useAppDispatch } from 'soapbox/hooks';
import { isExpired } from 'soapbox/utils/ads';

export default function useAds() {
  const dispatch = useAppDispatch();

  const getAds = async() => {
    return dispatch(async(_, getState) => {
      const provider = await getProvider(getState);
      if (provider) {
        return provider.getAds(getState);
      } else {
        return [];
      }
    });
  };

  const result = useQuery<Ad[]>(['ads'], getAds, {
    placeholderData: [],
  });

  // Filter out expired ads.
  const data = result.data?.filter(isExpired);

  return {
    ...result,
    data,
  };
}
