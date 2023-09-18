import type { Ad } from 'soapbox/schemas';

/** Time (ms) window to not display an ad if it's about to expire. */
const AD_EXPIRY_THRESHOLD = 5 * 60 * 1000;

/** Whether the ad is expired or about to expire. */
const isExpired = (ad: Pick<Ad, 'expires_at'>, threshold = AD_EXPIRY_THRESHOLD): boolean => {
  if (ad.expires_at) {
    const now = new Date();
    return now.getTime() > (new Date(ad.expires_at).getTime() - threshold);
  } else {
    return false;
  }
};

export { isExpired };
