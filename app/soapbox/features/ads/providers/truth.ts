import axios from 'axios';

import { getSettings } from 'soapbox/actions/settings';
import { normalizeCard } from 'soapbox/normalizers';

import type { AdProvider } from '.';
import type { Card } from 'soapbox/types/entities';

/** TruthSocial ad API entity. */
interface TruthAd {
  impression: string
  card: Card
  expires_at: string
  reason: string
}

/** Provides ads from the TruthSocial API. */
const TruthAdProvider: AdProvider = {
  getAds: async(getState) => {
    const state = getState();
    const settings = getSettings(state);

    try {
      const { data } = await axios.get<TruthAd[]>('/api/v2/truth/ads?device=desktop', {
        headers: {
          'Accept-Language': settings.get('locale', '*') as string,
        },
      });

      return data.map(item => ({
        ...item,
        card: normalizeCard(item.card),
      }));
    } catch (e) {
      // do nothing
    }

    return [];
  },
};

export default TruthAdProvider;
