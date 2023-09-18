import axios from 'axios';
import { z } from 'zod';

import { getSettings } from 'soapbox/actions/settings';
import { cardSchema } from 'soapbox/schemas/card';
import { filteredArray } from 'soapbox/schemas/utils';

import type { AdProvider } from '.';

/** TruthSocial ad API entity. */
const truthAdSchema = z.object({
  impression: z.string(),
  card: cardSchema,
  expires_at: z.string(),
  reason: z.string().catch(''),
});

/** Provides ads from the TruthSocial API. */
const TruthAdProvider: AdProvider = {
  getAds: async(getState) => {
    const state = getState();
    const settings = getSettings(state);

    try {
      const { data } = await axios.get('/api/v2/truth/ads?device=desktop', {
        headers: {
          'Accept-Language': z.string().catch('*').parse(settings.get('locale')),
        },
      });

      return filteredArray(truthAdSchema).parse(data);
    } catch (e) {
      // do nothing
    }

    return [];
  },
};

export default TruthAdProvider;
