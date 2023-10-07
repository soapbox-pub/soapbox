import { QueryClientProvider } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import * as BuildConfig from 'soapbox/build-config';
import LoadingScreen from 'soapbox/components/loading-screen';
import { StatProvider } from 'soapbox/contexts/stat-context';
import {
  ModalContainer,
  OnboardingWizard,
} from 'soapbox/features/ui/util/async-components';
import {
  useAppSelector,
  useOwnAccount,
  useSentry,
  useSettings,
  useSoapboxConfig,
  useTheme,
  useLocale,
} from 'soapbox/hooks';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import { queryClient } from 'soapbox/queries/client';
import { useCachedLocationHandler } from 'soapbox/utils/redirect';
import { generateThemeCss } from 'soapbox/utils/theme';

import ErrorBoundary from '../components/error-boundary';
import { store } from '../store';

import SoapboxLoad from './soapbox-load';

const GdprBanner = React.lazy(() => import('soapbox/components/gdpr-banner'));
const Helmet = React.lazy(() => import('soapbox/components/helmet'));
const EmbeddedStatus = React.lazy(() => import('soapbox/features/embedded-status'));
const UI = React.lazy(() => import('soapbox/features/ui'));

/** Highest level node with the Redux store. */
const SoapboxMount = () => {
  useCachedLocationHandler();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const soapboxConfig = useSoapboxConfig();

  const needsOnboarding = useAppSelector(state => state.onboarding.needsOnboarding);
  const showOnboarding = account && needsOnboarding;
  const { redirectRootNoLogin } = soapboxConfig;

  // @ts-ignore: I don't actually know what these should be, lol
  const shouldUpdateScroll = (prevRouterProps, { location }) => {
    return !(location.state?.soapboxModalKey && location.state?.soapboxModalKey !== prevRouterProps?.location?.state?.soapboxModalKey);
  };

  /** Render the onboarding flow. */
  const renderOnboarding = () => (
    <Suspense fallback={<LoadingScreen />}>
      <OnboardingWizard />
    </Suspense>
  );

  /** Render the auth layout or UI. */
  const renderSwitch = () => (
    <Switch>
      {(!me && redirectRootNoLogin) && (
        <Redirect exact from='/' to={redirectRootNoLogin} />
      )}

      <Route path='/' component={UI} />
    </Switch>
  );

  /** Render the onboarding flow or UI. */
  const renderBody = () => {
    if (showOnboarding) {
      return renderOnboarding();
    } else {
      return renderSwitch();
    }
  };

  return (
    <ErrorBoundary>
      <BrowserRouter basename={BuildConfig.FE_SUBDIRECTORY}>
        <CompatRouter>
          <ScrollContext shouldUpdateScroll={shouldUpdateScroll}>
            <Switch>
              <Route
                path='/embed/:statusId'
                render={(props) => <EmbeddedStatus params={props.match.params} />}
              />
              <Redirect from='/@:username/:statusId/embed' to='/embed/:statusId' />

              <Route>
                {renderBody()}

                <ModalContainer />
                <GdprBanner />

                <div id='toaster'>
                  <Toaster
                    position='top-right'
                    containerClassName='top-10'
                    containerStyle={{ top: 75 }}
                  />
                </div>
              </Route>
            </Switch>
          </ScrollContext>
        </CompatRouter>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

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
