import clsx from 'clsx';
import React from 'react';

import {
  useSentry,
  useSettings,
  useSoapboxConfig,
  useTheme,
  useLocale,
} from 'soapbox/hooks';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import { generateThemeCss } from 'soapbox/utils/theme';

const Helmet = React.lazy(() => import('soapbox/components/helmet'));

interface ISoapboxHead {
  children: React.ReactNode;
}

/** Injects metadata into site head with Helmet. */
const SoapboxHead: React.FC<ISoapboxHead> = ({ children }) => {
  const { locale, direction } = useLocale();
  const settings = useSettings();
  const soapboxConfig = useSoapboxConfig();

  const demo = !!settings.get('demo');
  const darkMode = useTheme() === 'dark';
  const themeCss = generateThemeCss(demo ? normalizeSoapboxConfig({ brandColor: '#0482d8' }) : soapboxConfig);

  const bodyClass = clsx('h-full bg-white text-base dark:bg-gray-800', {
    'no-reduce-motion': !settings.get('reduceMotion'),
    'underline-links': settings.get('underlineLinks'),
    'demetricator': settings.get('demetricator'),
  });

  useSentry(soapboxConfig.sentryDsn);

  return (
    <>
      <Helmet>
        <html lang={locale} className={clsx('h-full', { dark: darkMode })} />
        <body className={bodyClass} dir={direction} />
        {themeCss && <style id='theme' type='text/css'>{`:root{${themeCss}}`}</style>}
        {darkMode && <style type='text/css'>{':root { color-scheme: dark; }'}</style>}
        <meta name='theme-color' content={soapboxConfig.brandColor} />
      </Helmet>

      {children}
    </>
  );
};

export default SoapboxHead;
