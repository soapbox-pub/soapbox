import { getLocale } from 'soapbox/actions/settings';

import { useAppSelector } from './useAppSelector';

import type { CSSProperties } from 'react';

/** Locales which should be presented in right-to-left. */
const RTL_LOCALES = ['ar', 'ckb', 'fa', 'he'];

interface UseLocaleResult {
  locale: string
  direction: CSSProperties['direction']
}

/** Get valid locale from settings. */
const useLocale = (fallback = 'en'): UseLocaleResult => {
  const locale = useAppSelector((state) => getLocale(state, fallback));

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
