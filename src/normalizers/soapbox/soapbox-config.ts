import { normalizeUsername } from '@/utils/input.ts';
import { isPlainObject, mergeDeep } from '@/utils/merge-deep.ts';
import { fromDefaults } from '@/utils/normalizers.ts';
import { toTailwind } from '@/utils/tailwind.ts';
import { generateAccent } from '@/utils/theme.ts';

import type { TailwindColorPalette } from '@/types/colors.ts';

const DEFAULT_COLORS: TailwindColorPalette = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  'greentext': '#789922',
};

export interface PromoPanelItem {
  icon: string;
  text: string;
  url: string;
  textLocales: Record<string, string>;
}

export interface PromoPanel {
  items: PromoPanelItem[];
}

export interface FooterItem {
  title: string;
  url: string;
}

export interface CryptoAddress {
  address: string;
  note: string;
  ticker: string;
}

export interface SoapboxConfig {
  appleAppId: string | null;
  authProvider: string;
  logo: string;
  logoDarkMode: string | null;
  banner: string;
  brandColor: string; // Empty
  accentColor: string;
  colors: TailwindColorPalette;
  copyright: string;
  customCss: string[];
  defaultSettings: Record<string, unknown>;
  extensions: {
    patron?: {
      enabled?: boolean;
    };
    [key: string]: unknown;
  };
  gdpr: boolean;
  gdprUrl: string;
  greentext: boolean;
  promoPanel: PromoPanel;
  navlinks: {
    homeFooter: FooterItem[];
    [key: string]: unknown;
  };
  allowedEmoji: string[];
  verifiedIcon: string;
  verifiedCanEditName: boolean;
  displayFqn: boolean;
  cryptoAddresses: CryptoAddress[];
  cryptoDonatePanel: {
    limit: number;
  };
  aboutPages: Record<string, Record<string, unknown>>;
  authenticatedProfile: boolean;
  linkFooterMessage: string;
  links: Record<string, string>;
  displayCta: boolean;
  /** Whether to inject suggested profiles into the Home feed. */
  feedInjection: boolean;
  tileServer: string;
  tileServerAttribution: string;
  redirectRootNoLogin: string;
  /**
   * Whether to use the preview URL for media thumbnails.
   * On some platforms this can be too blurry without additional configuration.
   */
  mediaPreview: boolean;
  sentryDsn: string | undefined;
}

const soapboxConfigDefaults = (): SoapboxConfig => ({
  appleAppId: null,
  authProvider: '',
  logo: '',
  logoDarkMode: null,
  banner: '',
  brandColor: '', // Empty
  accentColor: '',
  colors: {},
  copyright: `♥${new Date().getFullYear()}. Copying is an act of love. Please copy and share.`,
  customCss: [],
  defaultSettings: {},
  extensions: {},
  gdpr: false,
  gdprUrl: '',
  greentext: false,
  promoPanel: { items: [] },
  navlinks: {
    homeFooter: [],
  },
  allowedEmoji: [
    '👍',
    '❤️',
    '😆',
    '😮',
    '😢',
    '😩',
  ],
  verifiedIcon: '',
  verifiedCanEditName: false,
  displayFqn: true,
  cryptoAddresses: [],
  cryptoDonatePanel: {
    limit: 1,
  },
  aboutPages: {},
  authenticatedProfile: true,
  linkFooterMessage: '',
  links: {},
  displayCta: true,
  feedInjection: true,
  tileServer: '',
  tileServerAttribution: '',
  redirectRootNoLogin: '',
  mediaPreview: false,
  sentryDsn: undefined,
});

type SoapboxConfigMap = Record<string, any>;

const normalizeCryptoAddress = (address: unknown): CryptoAddress => {
  const result = fromDefaults<CryptoAddress>({
    address: '',
    note: '',
    ticker: '',
  }, isPlainObject(address) ? address : {});

  return { ...result, ticker: result.ticker.replace(/^\$/, '').toLowerCase() };
};

const normalizeCryptoAddresses = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const addresses = Array.isArray(soapboxConfig.cryptoAddresses) ? soapboxConfig.cryptoAddresses : [];
  return { ...soapboxConfig, cryptoAddresses: addresses.map(normalizeCryptoAddress) };
};

const normalizeBrandColor = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = soapboxConfig.brandColor || soapboxConfig.colors?.primary?.['500'] || '';
  return { ...soapboxConfig, brandColor };
};

const normalizeAccentColor = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = soapboxConfig.brandColor;

  const accentColor = soapboxConfig.accentColor
    || soapboxConfig.colors?.accent?.['500']
    || (brandColor ? generateAccent(brandColor) : '');

  return { ...soapboxConfig, accentColor };
};

const normalizeColors = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const colors = mergeDeep(DEFAULT_COLORS, soapboxConfig.colors);
  return toTailwind({ ...soapboxConfig, colors });
};

const maybeAddMissingColors = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const colors = soapboxConfig.colors;

  const missing = {
    'gradient-start': colors.primary?.['500'],
    'gradient-end': colors.accent?.['500'],
    'accent-blue': colors.primary?.['600'],
  };

  return { ...soapboxConfig, colors: mergeDeep(missing, colors) };
};

const normalizePromoPanel = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const items: unknown[] = Array.isArray(soapboxConfig.promoPanel?.items) ? soapboxConfig.promoPanel.items : [];

  const promoPanel: PromoPanel = {
    items: items.map((item) => fromDefaults<PromoPanelItem>({
      icon: '',
      text: '',
      url: '',
      textLocales: {},
    }, isPlainObject(item) ? item : {})),
  };

  return { ...soapboxConfig, promoPanel };
};

const normalizeFooterLinks = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const items: unknown[] = Array.isArray(soapboxConfig.navlinks?.homeFooter) ? soapboxConfig.navlinks.homeFooter : [];

  const homeFooter = items.map((item) => fromDefaults<FooterItem>({
    title: '',
    url: '',
  }, isPlainObject(item) ? item : {}));

  return { ...soapboxConfig, navlinks: { ...soapboxConfig.navlinks, homeFooter } };
};

/** Single user mode is now managed by `redirectRootNoLogin`. */
const upgradeSingleUserMode = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const { singleUserMode, singleUserModeProfile, ...rest } = soapboxConfig;
  const redirectRootNoLogin = soapboxConfig.redirectRootNoLogin as string | undefined;

  if (!redirectRootNoLogin && singleUserMode && singleUserModeProfile) {
    return { ...rest, redirectRootNoLogin: `/@${normalizeUsername(singleUserModeProfile)}` };
  } else {
    return rest;
  }
};

/** Ensure a valid path is used. */
const normalizeRedirectRootNoLogin = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const { redirectRootNoLogin, ...rest } = soapboxConfig;

  if (!redirectRootNoLogin) return soapboxConfig;

  try {
    // Basically just get the pathname with a leading slash.
    const normalized = new URL(redirectRootNoLogin, 'http://a').pathname;

    if (normalized !== '/') {
      return { ...rest, redirectRootNoLogin: normalized };
    } else {
      // Prevent infinite redirect(?)
      return rest;
    }
  } catch (e) {
    console.error('You have configured an invalid redirect in Soapbox Config.');
    console.error(e);
    return rest;
  }
};

export const normalizeSoapboxConfig = (data: Record<string, any>): SoapboxConfig => {
  let soapboxConfig: SoapboxConfigMap = { ...data };

  soapboxConfig = normalizeBrandColor(soapboxConfig);
  soapboxConfig = normalizeAccentColor(soapboxConfig);
  soapboxConfig = normalizeColors(soapboxConfig);
  soapboxConfig = normalizePromoPanel(soapboxConfig);
  soapboxConfig = normalizeFooterLinks(soapboxConfig);
  soapboxConfig = maybeAddMissingColors(soapboxConfig);
  soapboxConfig = normalizeCryptoAddresses(soapboxConfig);
  soapboxConfig = upgradeSingleUserMode(soapboxConfig);
  soapboxConfig = normalizeRedirectRootNoLogin(soapboxConfig);

  return fromDefaults(soapboxConfigDefaults(), soapboxConfig);
};
