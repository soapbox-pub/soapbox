import clsx from 'clsx';
import { lazy, useEffect } from 'react';

import { useLocale } from 'soapbox/hooks/useLocale.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { useTheme } from 'soapbox/hooks/useTheme.ts';
import { normalizeSoapboxConfig } from 'soapbox/normalizers/index.ts';
import { startSentry } from 'soapbox/sentry.ts';
import { generateThemeCss } from 'soapbox/utils/theme.ts';

const Helmet = lazy(() => import('soapbox/components/helmet.tsx'));

interface ISoapboxHead {
  children: React.ReactNode;
}

/** Injects metadata into site head with Helmet. */
const SoapboxHead: React.FC<ISoapboxHead> = ({ children }) => {
  const { locale, direction } = useLocale();
  const { demo, reduceMotion, underlineLinks, demetricator } = useSettings();
  const soapboxConfig = useSoapboxConfig();
  const theme = useTheme();

  const themeCss = generateThemeCss(demo ? normalizeSoapboxConfig({ brandColor: '#0482d8' }) : soapboxConfig);
  const dsn = soapboxConfig.sentryDsn;

  const bodyClass = clsx('h-full bg-white text-base black:bg-black dark:bg-gray-800', {
    'no-reduce-motion': !reduceMotion,
    'underline-links': underlineLinks,
    'demetricator': demetricator,
    'font-arabic': ['ar', 'fa'].includes(locale),
    'font-javanese': locale === 'jv',
  });

  useEffect(() => {

    if (dsn) {
      startSentry(dsn).catch(console.error);
    }
  }, [dsn]);

  return (
    <>
      <Helmet>
        <html lang={locale} className={clsx('h-full', { 'dark': theme === 'dark', 'dark black': theme === 'black' })} />
        <body className={bodyClass} dir={direction} />
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        {themeCss && <style id='theme' type='text/css'>{`:root{${themeCss}}`}</style>}
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        {['dark', 'black'].includes(theme) && <style type='text/css'>{':root { color-scheme: dark; }'}</style>}
        {/* eslint-disable formatjs/no-literal-string-in-jsx */}
        {/* eslint-enable formatjs/no-literal-string-in-jsx */}
        <meta name='theme-color' content={soapboxConfig.brandColor} />
      </Helmet>

      {children}
    </>
  );
};

export default SoapboxHead;
