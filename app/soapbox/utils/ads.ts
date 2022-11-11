import type { AxiosResponse } from 'axios';
import type { Ad } from 'soapbox/types/soapbox';

/** Time (ms) window to not display an ad if it's about to expire. */
const AD_EXPIRY_THRESHOLD = 5 * 60 * 1000;

/** Whether the ad is expired or about to expire. */
const isExpired = (ad: Ad, threshold = AD_EXPIRY_THRESHOLD): boolean => {
  if (ad.expires_at) {
    const now = new Date();
    return now.getTime() > (new Date(ad.expires_at).getTime() - threshold);
  } else {
    return false;
  }
};

/** Get ad indexes from X-Truth-Ad-Indexes header. */
const adIndexesFromHeader = (response: AxiosResponse): number[] => {
  const header: string = response.headers['x-truth-ad-indexes'];
  const strIndexes: string[] = header.split(',');
  return strIndexes.map(strIndex => Number(strIndex.trim()));
};

export {
  isExpired,
  adIndexesFromHeader,
};
