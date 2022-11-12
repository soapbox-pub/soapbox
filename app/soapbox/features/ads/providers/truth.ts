import { getSettings } from 'soapbox/actions/settings';
import { normalizeCard } from 'soapbox/normalizers';

import type { AdProvider } from '.';
import type { Card } from 'soapbox/types/entities';

/** TruthSocial ad API entity. */
interface TruthAd {
  impression: string,
  card: Card,
  expires_at: string,
  reason: string,
}

/** Provides ads from the TruthSocial API. */
const TruthAdProvider: AdProvider = {
  getAds: async(getState) => {
    const state = getState();
    const settings = getSettings(state);

    const response = await fetch('/api/v2/truth/ads?device=desktop', {
      headers: {
        'Accept-Language': settings.get('locale', '*') as string,
      },
    });

    if (response.ok) {
      const data = await response.json() as TruthAd[];
      return data.map(item => ({
        ...item,
        card: normalizeCard(item.card),
      }));
    }

    return [];
  },
};

export default TruthAdProvider;
