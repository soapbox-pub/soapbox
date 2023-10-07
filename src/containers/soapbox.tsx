import { QueryClientProvider } from '@tanstack/react-query';
import clsx from 'clsx';
import React from 'react';
import { Provider } from 'react-redux';

import { StatProvider } from 'soapbox/contexts/stat-context';
import {
  useSentry,
  useSettings,
  useSoapboxConfig,
  useTheme,
  useLocale,
} from 'soapbox/hooks';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import { queryClient } from 'soapbox/queries/client';
import { generateThemeCss } from 'soapbox/utils/theme';

import { store } from '../store';

import SoapboxLoad from './soapbox-load';
import SoapboxMount from './soapbox-mount';

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

/** The root React node of the application. */
const Soapbox: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StatProvider>
          <SoapboxHead>
            <SoapboxLoad>
              <SoapboxMount />
            </SoapboxLoad>
          </SoapboxHead>
        </StatProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default Soapbox;
