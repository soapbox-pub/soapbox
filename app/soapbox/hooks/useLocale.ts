import MESSAGES from 'soapbox/locales/messages';

import { useSettings } from './useSettings';

import type { CSSProperties } from 'react';

/** Locales which should be presented in right-to-left. */
const RTL_LOCALES = ['ar', 'ckb', 'fa', 'he'];

/** Ensure the given locale exists in our codebase */
const validLocale = (locale: string): boolean => Object.keys(MESSAGES).includes(locale);

interface UseLocaleResult {
  locale: string
  direction: CSSProperties['direction']
}

/** Get valid locale from settings. */
const useLocale = (fallback = 'en'): UseLocaleResult => {
  const settings = useSettings();
  const userLocale = settings.get('locale') as unknown;

  const locale =
    (typeof userLocale === 'string' && validLocale(userLocale))
      ? userLocale
      : fallback;

  const direction: CSSProperties['direction'] =
    RTL_LOCALES.includes(locale)
      ? 'rtl'
      : 'ltr';

  return {
    locale,
    direction,
  };
};

export { useLocale };
