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
  gray: [ 5.640168899709693, -71.25227844367963, 42.13578614093887 ],
  primary: [ 0, 0, 0 ],
  secondary: [ -264.41907148380454, 3.47034415017923, 16.72498531826924 ],
  success: [ -132.16963284744344, 22.729414313887375, 27.93609003256976 ],
  danger: [ -254.94219506629216, -0.22042936848366423, 12.675221477923778 ],
};

const PALETTE_DELTAS: Record<string, HSLPaletteDelta> = {
  gray: {
    '50': [ 0.22937683270356501, -1.5864743831017971, 15.567851989991112 ],
    '100': [ 34.311838173845615, -1.2141376862436761, 13.938662622153828 ],
    '200': [ -6.726925619450583, -1.3474032449266322, 12.477917572764795 ],
    '300': [ -6.803051539716591, -1.1039007790831639, 9.366828937389187 ],
    '400': [ 7.251025534431051, -0.7564434934117528, 6.308652406934627 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0.528273854081192, 5.024155622767128, -28.942510078414657 ],
    '700': [ 0.753585022750201, 9.244324145778112, -42.27720854061048 ],
    '800': [ -3.38885080806142, 38.377108591613, -72.05591766747844 ],
    '900': [ -3.6531980550540197, 49.0899586185372, -77.8873736703074 ],
  },
  primary: {
    '50': [ -12.328127784192901, -67.24292824683431, 53.24283923089697 ],
    '100': [ -11.411261541571491, -62.439158441446395, 49.48672631248416 ],
    '200': [ -9.416727076537427, -53.876459261840154, 42.38848417160097 ],
    '300': [ -3.767637832203661, -27.858121091970574, 19.530562906640746 ],
    '400': [ -1.6746167286863738, -15.676431605871016, 7.808121295055564 ],
    '500': [ 0, 0, 0 ],
    '600': [ -0.003909458369605545, 2.5576939049011287, -7.724998167194286 ],
    '700': [ 0.11738125411591227, -5.255248276711185, -21.911667783093854 ],
    '800': [ 0.1328770612169592, -9.311121602273253, -29.182323283856825 ],
    '900': [ 1.9869708446556729, -22.162319825142433, -35.75158752936853 ],
  },
  // @ts-ignore
  secondary: {
    '100': [ 347.880182793043, -68.47214895215055, 32.867057572173536 ],
    '200': [ 350.05034589809117, -52.65112125949534, 21.087557709426832 ],
    '300': [ 354.031215223099, -23.94959581070235, 7.6397685025461755 ],
    '400': [ -1.739008662838304, -13.175216574546795, 3.6494520365984613 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0.27516723567895696, -0.06197773826696107, -0.02163844988602648 ],
  },
  success: {
    '50': [ 6.272318640784931, -87.82006472610146, 27.923961374235645 ],
    '100': [ 7.515812986311346, -76.24726912121697, 26.015113902196305 ],
    '200': [ 6.682412508442582, -58.98301894933322, 22.183456696291486 ],
    '300': [ 5.042191328515884, -32.36248565174746, 16.65634548562005 ],
    '400': [ 2.176996549793728, -9.407758928036145, 8.956568283122635 ],
    '500': [ 0, 0, 0 ],
    '600': [ -0.372610730302938, 1.0253878418950535, -11.388518702503106 ],
    '700': [ 0.5145707207430519, -0.9085081381356162, -23.343759036504466 ],
    '800': [ 1.8284285283559427, -4.840289897227791, -32.88658597113674 ],
    '900': [ 3.143760008542955, -7.518152045294627, -39.533036861110965 ],
  },
  danger: {
    '50': [ -0.12913498368561527, -70.44886946123935, 41.43265384536481 ],
    '100': [ -0.0488135435926349, -67.15618734554207, 37.13987057891991 ],
    '200': [ -0.02122364058786097, -61.17995574356704, 30.822488851023962 ],
    '300': [ -0.008445121602528971, -49.40898982365067, 21.29509643080908 ],
    '400': [ -0.0021433776363899426, -25.474902071013723, 9.156088139819957 ],
    '500': [ 0, 0, 0 ],
    '600': [ 0.0006646718484049075, 14.619377779600981, -7.0385269603369665 ],
    '700': [ 0.0007147927161721412, 15.964147857357688, -15.008669041883302 ],
    '800': [ 0.0005467342060985203, 11.610574809571574, -21.760068390290982 ],
    '900': [ 0.00015621259826481548, 2.9773216728644343, -26.91230815141926 ],
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
  const hsluv = convert(soapboxConfig.get('brandColor') || '#0482d8').hsluv;
  const brandColor = { h: hsluv.hu, s: hsluv.s, l: hsluv.l };

  const colors = Object.keys(SEED_COLOR_DELTAS).reduce((acc, curr) => {
    const seed = hslShift(brandColor, SEED_COLOR_DELTAS[curr]);
    const hslPalette = generatePalette(seed, PALETTE_DELTAS[curr]);
    const hexColors = Object.keys(hslPalette).reduce((acc, curr) => {
      const hsl = (hslPalette as any)[curr as any];
      const hex = convert({ hu: hsl.h, s: hsl.s, l: hsl.l }).hex;
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
