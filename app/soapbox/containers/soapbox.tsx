'use strict';

import { QueryClientProvider } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import { loadInstance } from 'soapbox/actions/instance';
import { fetchMe } from 'soapbox/actions/me';
import { loadSoapboxConfig, getSoapboxConfig } from 'soapbox/actions/soapbox';
import { fetchVerificationConfig } from 'soapbox/actions/verification';
import * as BuildConfig from 'soapbox/build-config';
import GdprBanner from 'soapbox/components/gdpr-banner';
import Helmet from 'soapbox/components/helmet';
import LoadingScreen from 'soapbox/components/loading-screen';
import { StatProvider } from 'soapbox/contexts/stat-context';
import AuthLayout from 'soapbox/features/auth-layout';
import EmbeddedStatus from 'soapbox/features/embedded-status';
import PublicLayout from 'soapbox/features/public-layout';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  ModalContainer,
  OnboardingWizard,
  WaitlistPage,
} from 'soapbox/features/ui/util/async-components';
import { createGlobals } from 'soapbox/globals';
import {
  useAppSelector,
  useAppDispatch,
  useOwnAccount,
  useFeatures,
  useSoapboxConfig,
  useSettings,
  useTheme,
  useLocale,
  useInstance,
  useRegistrationStatus,
} from 'soapbox/hooks';
import MESSAGES from 'soapbox/locales/messages';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import { queryClient } from 'soapbox/queries/client';
import { useCachedLocationHandler } from 'soapbox/utils/redirect';
import { generateThemeCss } from 'soapbox/utils/theme';

import { checkOnboardingStatus } from '../actions/onboarding';
import { preload } from '../actions/preload';
import ErrorBoundary from '../components/error-boundary';
import UI from '../features/ui';
import { store } from '../store';

// Configure global functions for developers
createGlobals(store);

// Preload happens synchronously
store.dispatch(preload() as any);

// This happens synchronously
store.dispatch(checkOnboardingStatus() as any);

/** Load initial data from the backend */
const loadInitial = () => {
  // @ts-ignore
  return async(dispatch, getState) => {
    // Await for authenticated fetch
    await dispatch(fetchMe());
    // Await for feature detection
    await dispatch(loadInstance());
    // Await for configuration
    await dispatch(loadSoapboxConfig());

    const state = getState();
    const soapboxConfig = getSoapboxConfig(state);
    const pepeEnabled = soapboxConfig.getIn(['extensions', 'pepe', 'enabled']) === true;

    if (pepeEnabled && !state.me) {
      await dispatch(fetchVerificationConfig());
    }
  };
};

/** Highest level node with the Redux store. */
const SoapboxMount = () => {
  useCachedLocationHandler();

  const me = useAppSelector(state => state.me);
  const instance = useInstance();
  const { account } = useOwnAccount();
  const soapboxConfig = useSoapboxConfig();
  const features = useFeatures();
  const { pepeEnabled } = useRegistrationStatus();

  const waitlisted = account && account.source?.approved === false;
  const needsOnboarding = useAppSelector(state => state.onboarding.needsOnboarding);
  const showOnboarding = account && !waitlisted && needsOnboarding;
  const { redirectRootNoLogin } = soapboxConfig;

  // @ts-ignore: I don't actually know what these should be, lol
  const shouldUpdateScroll = (prevRouterProps, { location }) => {
    return !(location.state?.soapboxModalKey && location.state?.soapboxModalKey !== prevRouterProps?.location?.state?.soapboxModalKey);
  };

  /** Render the onboarding flow. */
  const renderOnboarding = () => (
    <BundleContainer fetchComponent={OnboardingWizard} loading={LoadingScreen}>
      {(Component) => <Component />}
    </BundleContainer>
  );

  /** Render the auth layout or UI. */
  const renderSwitch = () => (
    <Switch>
      <Redirect from='/v1/verify_email/:token' to='/verify/email/:token' />

      {/* Redirect signup route depending on Pepe enablement. */}
      {/* We should prefer using /signup in components. */}
      {pepeEnabled ? (
        <Redirect from='/signup' to='/verify' />
      ) : (
        <Redirect from='/verify' to='/signup' />
      )}

      {waitlisted && (
        <Route render={(props) => (
          <BundleContainer fetchComponent={WaitlistPage} loading={LoadingScreen}>
            {(Component) => <Component {...props} account={account} />}
          </BundleContainer>
        )}
        />
      )}

      {!me && (redirectRootNoLogin
        ? <Redirect exact from='/' to={redirectRootNoLogin} />
        : <Route exact path='/' component={PublicLayout} />)}

      {!me && (
        <Route exact path='/' component={PublicLayout} />
      )}

      <Route exact path='/about/:slug?' component={PublicLayout} />
      <Route path='/login' component={AuthLayout} />

      {(features.accountCreation && instance.registrations) && (
        <Route exact path='/signup' component={AuthLayout} />
      )}

      {pepeEnabled && (
        <Route path='/verify' component={AuthLayout} />
      )}

      <Route path='/reset-password' component={AuthLayout} />
      <Route path='/edit-password' component={AuthLayout} />
      <Route path='/invite/:token' component={AuthLayout} />

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

                <BundleContainer fetchComponent={ModalContainer}>
                  {Component => <Component />}
                </BundleContainer>

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

interface ISoapboxLoad {
  children: React.ReactNode
}

/** Initial data loader. */
const SoapboxLoad: React.FC<ISoapboxLoad> = ({ children }) => {
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const swUpdating = useAppSelector(state => state.meta.swUpdating);
  const { locale } = useLocale();

  const [messages, setMessages] = useState<Record<string, string>>({});
  const [localeLoading, setLocaleLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  /** Whether to display a loading indicator. */
  const showLoading = [
    me === null,
    me && !account,
    !isLoaded,
    localeLoading,
    swUpdating,
  ].some(Boolean);

  // Load the user's locale
  useEffect(() => {
    MESSAGES[locale]().then(messages => {
      setMessages(messages);
      setLocaleLoading(false);
    }).catch(() => { });
  }, [locale]);

  // Load initial data from the API
  useEffect(() => {
    dispatch(loadInitial()).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, []);

  // intl is part of loading.
  // It's important nothing in here depends on intl.
  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

interface ISoapboxHead {
  children: React.ReactNode
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
