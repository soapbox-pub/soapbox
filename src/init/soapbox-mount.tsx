import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import * as BuildConfig from 'soapbox/build-config';
import LoadingScreen from 'soapbox/components/loading-screen';
import {
  ModalContainer,
  OnboardingWizard,
} from 'soapbox/features/ui/util/async-components';
import {
  useAppSelector,
  useOwnAccount,
  useSoapboxConfig,
} from 'soapbox/hooks';
import { useCachedLocationHandler } from 'soapbox/utils/redirect';

import ErrorBoundary from '../components/error-boundary';

const GdprBanner = React.lazy(() => import('soapbox/components/gdpr-banner'));
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
                render={(props) => (
                  <Suspense>
                    <EmbeddedStatus params={props.match.params} />
                  </Suspense>
                )}
              />
              <Redirect from='/@:username/:statusId/embed' to='/embed/:statusId' />

              <Route>
                {renderBody()}

                <Suspense>
                  <ModalContainer />
                </Suspense>

                <Suspense>
                  <GdprBanner />
                </Suspense>

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

export default SoapboxMount;
