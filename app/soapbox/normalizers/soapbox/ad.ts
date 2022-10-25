import {
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { CardRecord, normalizeCard } from '../card';

import type { Ad } from 'soapbox/features/ads/providers';

export const AdRecord = ImmutableRecord<Ad>({
  card: CardRecord(),
  impression: undefined as string | undefined,
  expires_at: undefined as string | undefined,
  reason: undefined as string | undefined,
});

/** Normalizes an ad from Soapbox Config. */
export const normalizeAd = (ad: Record<string, any>) => {
  const map = ImmutableMap<string, any>(fromJS(ad));
  const card = normalizeCard(map.get('card'));
  const expiresAt = map.get('expires_at') || map.get('expires');

  return AdRecord(map.merge({
    card,
    expires_at: expiresAt,
  }));
};
