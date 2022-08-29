import { normalizeCard } from 'soapbox/normalizers';

import { isExpired } from '../ads';

/** 3 minutes in milliseconds. */
const threeMins = 3 * 60 * 1000;

/** 5 minutes in milliseconds. */
const fiveMins = 5 * 60 * 1000;

test('isExpired()', () => {
  const now = new Date();
  const card = normalizeCard({});

  // Sanity tests.
  expect(isExpired({ expires: now, card })).toBe(true);
  expect(isExpired({ expires: new Date(now.getTime() + 999999), card })).toBe(false);

  // Testing the 5-minute mark.
  expect(isExpired({ expires: new Date(now.getTime() + threeMins), card }, fiveMins)).toBe(true);
  expect(isExpired({ expires: new Date(now.getTime() + fiveMins + 1000), card }, fiveMins)).toBe(false);
});
