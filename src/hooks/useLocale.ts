import { getLocale } from 'soapbox/actions/settings';

import { useAppSelector } from './useAppSelector';

/** Locales which should be presented in right-to-left. */
const RTL_LOCALES = ['ar', 'ckb', 'fa', 'he'];

interface UseLocaleResult {
  locale: string;
  direction: 'ltr' | 'rtl';
}

/** Get valid locale from settings. */
const useLocale = (fallback = 'en'): UseLocaleResult => {
  const locale = useAppSelector((state) => getLocale(state, fallback));

  const direction: 'ltr' | 'rtl' =
    RTL_LOCALES.includes(locale)
      ? 'rtl'
      : 'ltr';

  return {
    locale,
    direction,
  };
};

export { useLocale };
