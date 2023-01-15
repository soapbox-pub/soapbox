import { Record as ImmutableRecord } from 'immutable';

import { normalizeSoapboxConfig } from '../soapbox-config';

describe('normalizeSoapboxConfig()', () => {
  it('adds base fields', () => {
    const result = normalizeSoapboxConfig({});
    expect(result.brandColor).toBe('');
    expect(ImmutableRecord.isRecord(result)).toBe(true);
  });

  it('normalizes cryptoAddresses', () => {
    const soapboxConfig = {
      cryptoAddresses: [
        { ticker: '$BTC', address: 'bc1q9cx35adpm73aq2fw40ye6ts8hfxqzjr5unwg0n' },
      ],
    };

    const expected = {
      cryptoAddresses: [
        { ticker: 'btc', address: 'bc1q9cx35adpm73aq2fw40ye6ts8hfxqzjr5unwg0n', note: '' },
      ],
    };

    const result = normalizeSoapboxConfig(soapboxConfig);
    expect(result.cryptoAddresses.size).toBe(1);
    expect(ImmutableRecord.isRecord(result.cryptoAddresses.get(0))).toBe(true);
    expect(result.toJS()).toMatchObject(expected);
  });

  it('normalizes promoPanel', () => {
    const result = normalizeSoapboxConfig(require('soapbox/__fixtures__/spinster-soapbox.json'));
    expect(ImmutableRecord.isRecord(result.promoPanel)).toBe(true);
    expect(ImmutableRecord.isRecord(result.promoPanel.items.get(0))).toBe(true);
    expect(result.promoPanel.items.get(2)?.icon).toBe('question-circle');
  });

  it('upgrades singleUserModeProfile to redirectRootNoLogin', () => {
    expect(normalizeSoapboxConfig({ singleUserMode: true, singleUserModeProfile: 'alex' }).redirectRootNoLogin).toBe('/@alex');
    expect(normalizeSoapboxConfig({ singleUserMode: true, singleUserModeProfile: '@alex' }).redirectRootNoLogin).toBe('/@alex');
    expect(normalizeSoapboxConfig({ singleUserMode: true, singleUserModeProfile: 'alex@gleasonator.com' }).redirectRootNoLogin).toBe('/@alex@gleasonator.com');
    expect(normalizeSoapboxConfig({ singleUserMode: false, singleUserModeProfile: 'alex' }).redirectRootNoLogin).toBe('');
  });

  it('normalizes redirectRootNoLogin', () => {
    expect(normalizeSoapboxConfig({ redirectRootNoLogin: 'benis' }).redirectRootNoLogin).toBe('/benis');
    expect(normalizeSoapboxConfig({ redirectRootNoLogin: '/benis' }).redirectRootNoLogin).toBe('/benis');
    expect(normalizeSoapboxConfig({ redirectRootNoLogin: '/' }).redirectRootNoLogin).toBe('');
  });
});
