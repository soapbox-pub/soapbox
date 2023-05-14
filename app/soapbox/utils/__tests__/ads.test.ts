import { buildAd } from 'soapbox/jest/factory';

import { isExpired } from '../ads';

/** 3 minutes in milliseconds. */
const threeMins = 3 * 60 * 1000;

/** 5 minutes in milliseconds. */
const fiveMins = 5 * 60 * 1000;

test('isExpired()', () => {
  const now = new Date();
  const iso = now.toISOString();
  const epoch = now.getTime();

  // Sanity tests.
  expect(isExpired(buildAd({ expires_at: iso }))).toBe(true);
  expect(isExpired(buildAd({ expires_at: new Date(epoch + 999999).toISOString() }))).toBe(false);

  // Testing the 5-minute mark.
  expect(isExpired(buildAd({ expires_at: new Date(epoch + threeMins).toISOString() }), fiveMins)).toBe(true);
  expect(isExpired(buildAd({ expires_at: new Date(epoch + fiveMins + 1000).toISOString() }), fiveMins)).toBe(false);
});
