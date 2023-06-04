import { useQuery } from '@tanstack/react-query';

import { Ad, getProvider } from 'soapbox/features/ads/providers';
import { useAppDispatch } from 'soapbox/hooks';
import { adSchema } from 'soapbox/schemas';
import { filteredArray } from 'soapbox/schemas/utils';
import { isExpired } from 'soapbox/utils/ads';

const AdKeys = {
  ads: ['ads'] as const,
};

function useAds() {
  const dispatch = useAppDispatch();

  const getAds = async () => {
    return dispatch(async (_, getState) => {
      const provider = await getProvider(getState);
      if (provider) {
        return provider.getAds(getState);
      } else {
        return [];
      }
    });
  };

  const result = useQuery<Ad[]>(AdKeys.ads, getAds, {
    placeholderData: [],
  });

  // Filter out expired ads.
  const data = filteredArray(adSchema)
    .parse(result.data)
    .filter(ad => !isExpired(ad));

  return {
    ...result,
    data,
  };
}

export { useAds as default, AdKeys };
