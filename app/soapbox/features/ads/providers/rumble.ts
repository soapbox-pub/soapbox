import axios from 'axios';

import { getSettings } from 'soapbox/actions/settings';
import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import { normalizeAd, normalizeCard } from 'soapbox/normalizers';

import type { AdProvider } from '.';

/** Rumble ad API entity. */
interface RumbleAd {
  type: number
  impression: string
  click: string
  asset: string
  expires: number
}

/** Response from Rumble ad server. */
interface RumbleApiResponse {
  count: number
  ads: RumbleAd[]
}

/** Provides ads from Soapbox Config. */
const RumbleAdProvider: AdProvider = {
  getAds: async(getState) => {
    const state = getState();
    const settings = getSettings(state);
    const soapboxConfig = getSoapboxConfig(state);
    const endpoint = soapboxConfig.extensions.getIn(['ads', 'endpoint']) as string | undefined;

    if (endpoint) {
      try {
        const { data } = await axios.get<RumbleApiResponse>(endpoint, {
          headers: {
            'Accept-Language': settings.get('locale', '*') as string,
          },
        });

        return data.ads.map(item => normalizeAd({
          impression: item.impression,
          card: normalizeCard({
            type: item.type === 1 ? 'link' : 'rich',
            image: item.asset,
            url: item.click,
          }),
          expires_at: new Date(item.expires * 1000),
        }));
      } catch (e) {
        // do nothing
      }
    }

    return [];
  },
};

export default RumbleAdProvider;
