import { describe, expect, it } from 'vitest';

import { normalizeSoapboxConfig } from './soapbox-config.ts';

describe('normalizeSoapboxConfig()', () => {
  it('adds base fields', () => {
    const result = normalizeSoapboxConfig({});
    expect(result.brandColor).toBe('');
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
    expect(result.cryptoAddresses.length).toBe(1);
    expect(result).toMatchObject(expected);
  });

  it('normalizes promoPanel', async () => {
    const soapboxConfig = await import('@/__fixtures__/spinster-soapbox.json');
    const result = normalizeSoapboxConfig(soapboxConfig);
    expect(result.promoPanel.items[2]?.icon).toBe('question-circle');
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
