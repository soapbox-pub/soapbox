import { convert } from 'chromatism';
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';
import trimStart from 'lodash/trimStart';

import { generatePalette, HSLDelta, HSLPaletteDelta, hslShift } from 'soapbox/utils/hsl';
import { generateAccent } from 'soapbox/utils/theme';

import { normalizeAd } from './ad';

import type {
  Ad,
  PromoPanelItem,
  FooterItem,
  CryptoAddress,
} from 'soapbox/types/soapbox';

const SEED_COLOR_DELTAS: Record<string, HSLDelta> = {
  gray: [ 5.662650602409599, -75.85714285714285, 22.74509803921567 ],
  primary: [ 0, 0, 0 ],
  secondary: [ 100.66265060240963, 17, 3.137254901960773 ],
  success: [ -102.25145982703822, -12.437229437229433, -15.490196078431374 ],
  danger: [ -244.33734939759037, 1.2364532019704342, -0.5882352941176521 ],
};

const PALETTE_DELTAS: Record<string, HSLPaletteDelta> = {
  gray: {
    '50': [ -249.99999999999997, -7.142857142857152, 16.47058823529413 ],
    '100': [ 50.00000000000003, 3.968253968253923, 14.705882352941188 ],
    '200': [ -9.999999999999972, -1.2605042016806918, 13.137254901960802 ],
    '300': [ -9.999999999999972, -1.2605042016807007, 9.803921568627459 ],
    '400': [ 10.000000000000028, -1.2605042016807042, 6.47058823529413 ],
    '500': [ 0, 0, 0 ],
    '600': [ 1.2500000000000853, -0.2463054187192224, -29.019607843137244 ],
    '700': [ 2.0000000000000284, 2.2029372496662143, -41.56862745098039 ],
    '800': [ -2.4999999999999716, 29.220779220779214, -66.27450980392156 ],
    '900': [ -2.2580645161289965, 42.063492063492056, -71.17647058823528 ],
  },
  primary: {
    '50': [ -18.454996456413852, 17, 35.88235294117647 ],
    '100': [ -17.88573649436458, 17, 33.13725490196078 ],
    '200': [ -16.337349397590344, 13.491228070175453, 28.039215686274495 ],
    '300': [ -9.883567884985325, 6.473684210526329, 13.13725490196078 ],
    '400': [ -5.604955031393189, 0.5294117647058698, 5.882352941176457 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0.1831985476150919, -25.063492063492077, -10.196078431372555 ],
    '700': [ 0, -29.451612903225815, -30.3921568627451 ],
    '800': [ -0.1994183631076396, -29.29629629629629, -39.6078431372549 ],
    '900': [ 3.4045860862806023, -33.79365079365079, -48.43137254901961 ],
  },
  // @ts-ignore
  secondary: {
    '100': [ -2.419354838709694, 0, 30.000000000000007 ],
    '200': [ -2.692307692307679, 0, 20.7843137254902 ],
    '300': [ -2.6978417266187193, 0, 8.823529411764703 ],
    '400': [ 0, 0, 4.705882352941181 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0.326086956521749, 0, 0 ],
  },
  success: {
    '50': [ -3.624351109013645, 5.907817672523635, 51.372549019607845 ],
    '100': [ -1.4608895705521832, 13.647755753018956, 47.25490196078431 ],
    '200': [ -1.0858895705521547, 8.384597858282106, 39.803921568627445 ],
    '300': [ -0.37160385626643233, 6.079565203652791, 27.84313725490196 ],
    '400': [ -0.19399767866025286, -1.403892058097668, 12.74509803921569 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0.041770003915928555, 5.653445653445644, -9.019607843137258 ],
    '700': [ 0.34401697150391897, 1.2493099741421787, -16.07843137254902 ],
    '800': [ 0.6989205560301173, -6.335128286347796, -21.1764705882353 ],
    '900': [ 1.7236342389716413, -9.397722019081243, -25.098039215686278 ],
  },
  danger: {
    '50': [ 0, 1.477832512315345, 37.05882352941176 ],
    '100': [ 0, 9.096880131362923, 33.921568627450974 ],
    '200': [ 0, 12.059843094325885, 29.2156862745098 ],
    '300': [ 0, 9.311933894803772, 21.568627450980394 ],
    '400': [ 0, 6.367573643667157, 10.588235294117645 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0, -12.014230979748206, -9.607843137254903 ],
    '700': [ 0, -10.527533014176996, -18.431372549019613 ],
    '800': [ 0, -14.236453201970434, -24.90196078431373 ],
    '900': [ 0, -21.415940381457617, -29.6078431372549 ],
  },
};

export const PromoPanelItemRecord = ImmutableRecord({
  icon: '',
  text: '',
  url: '',
  textLocales: ImmutableMap<string, string>(),
});

export const PromoPanelRecord = ImmutableRecord({
  items: ImmutableList<PromoPanelItem>(),
});

export const FooterItemRecord = ImmutableRecord({
  title: '',
  url: '',
});

export const CryptoAddressRecord = ImmutableRecord({
  address: '',
  note: '',
  ticker: '',
});

export const SoapboxConfigRecord = ImmutableRecord({
  ads: ImmutableList<Ad>(),
  appleAppId: null,
  authProvider: '',
  logo: '',
  logoDarkMode: null,
  banner: '',
  brandColor: '', // Empty
  accentColor: '',
  colors: ImmutableMap(),
  copyright: `♥${new Date().getFullYear()}. Copying is an act of love. Please copy and share.`,
  customCss: ImmutableList<string>(),
  defaultSettings: ImmutableMap<string, any>(),
  extensions: ImmutableMap(),
  gdpr: false,
  gdprUrl: '',
  greentext: false,
  promoPanel: PromoPanelRecord(),
  navlinks: ImmutableMap({
    homeFooter: ImmutableList<FooterItem>(),
  }),
  allowedEmoji: ImmutableList<string>([
    '👍',
    '❤️',
    '😆',
    '😮',
    '😢',
    '😩',
  ]),
  verifiedIcon: '',
  verifiedCanEditName: false,
  displayFqn: true,
  cryptoAddresses: ImmutableList<CryptoAddress>(),
  cryptoDonatePanel: ImmutableMap({
    limit: 1,
  }),
  aboutPages: ImmutableMap<string, ImmutableMap<string, unknown>>(),
  mobilePages: ImmutableMap<string, ImmutableMap<string, unknown>>(),
  authenticatedProfile: true,
  singleUserMode: false,
  singleUserModeProfile: '',
  linkFooterMessage: '',
  links: ImmutableMap<string, string>(),
}, 'SoapboxConfig');

type SoapboxConfigMap = ImmutableMap<string, any>;

const normalizeAds = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const ads = ImmutableList<Record<string, any>>(soapboxConfig.get('ads'));
  return soapboxConfig.set('ads', ads.map(normalizeAd));
};

const normalizeCryptoAddress = (address: unknown): CryptoAddress => {
  return CryptoAddressRecord(ImmutableMap(fromJS(address))).update('ticker', ticker => {
    return trimStart(ticker, '$').toLowerCase();
  });
};

const normalizeCryptoAddresses = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const addresses = ImmutableList(soapboxConfig.get('cryptoAddresses'));
  return soapboxConfig.set('cryptoAddresses', addresses.map(normalizeCryptoAddress));
};

const normalizeBrandColor = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = soapboxConfig.get('brandColor') || soapboxConfig.getIn(['colors', 'primary', '500']) || '';
  return soapboxConfig.set('brandColor', brandColor);
};

const normalizeAccentColor = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = soapboxConfig.get('brandColor');

  const accentColor = soapboxConfig.get('accentColor')
    || soapboxConfig.getIn(['colors', 'accent', '500'])
    || (brandColor ? generateAccent(brandColor) : '');

  return soapboxConfig.set('accentColor', accentColor);
};

const normalizeColors = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = convert(soapboxConfig.get('brandColor') || '#0482d8').hsl;

  const colors = Object.keys(SEED_COLOR_DELTAS).reduce((acc, curr) => {
    const seed = hslShift(brandColor, SEED_COLOR_DELTAS[curr]);
    const hslPalette = generatePalette(seed, PALETTE_DELTAS[curr]);
    const hexColors = Object.keys(hslPalette).reduce((acc, curr) => {
      const hex = convert((hslPalette as any)[curr as any]).hex;
      acc[curr] = hex;
      return acc;
    }, {} as any);
    acc[curr] = hexColors;
    return acc;
  }, {} as any);

  return soapboxConfig.set('colors', fromJS(colors));
};

const maybeAddMissingColors = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const colors = soapboxConfig.get('colors');

  const missing = ImmutableMap({
    'gradient-start': colors.getIn(['primary', '500']),
    'gradient-end': colors.getIn(['primary', '500']),
    'accent-blue': colors.getIn(['primary', '600']),
  });

  return soapboxConfig.set('colors', missing.mergeDeep(colors));
};

const normalizePromoPanel = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const promoPanel = PromoPanelRecord(soapboxConfig.get('promoPanel'));
  const items = promoPanel.items.map(PromoPanelItemRecord);
  return soapboxConfig.set('promoPanel', promoPanel.set('items', items));
};

const normalizeFooterLinks = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const path = ['navlinks', 'homeFooter'];
  const items = (soapboxConfig.getIn(path, ImmutableList()) as ImmutableList<any>).map(FooterItemRecord);
  return soapboxConfig.setIn(path, items);
};

export const normalizeSoapboxConfig = (soapboxConfig: Record<string, any>) => {
  return SoapboxConfigRecord(
    ImmutableMap(fromJS(soapboxConfig)).withMutations(soapboxConfig => {
      normalizeBrandColor(soapboxConfig);
      normalizeAccentColor(soapboxConfig);
      normalizeColors(soapboxConfig);
      normalizePromoPanel(soapboxConfig);
      normalizeFooterLinks(soapboxConfig);
      maybeAddMissingColors(soapboxConfig);
      normalizeCryptoAddresses(soapboxConfig);
      normalizeAds(soapboxConfig);
    }),
  );
};
