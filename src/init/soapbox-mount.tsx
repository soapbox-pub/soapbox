import React, { Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import { openModal } from 'soapbox/actions/modals';
import * as BuildConfig from 'soapbox/build-config';
import LoadingScreen from 'soapbox/components/loading-screen';
import SiteErrorBoundary from 'soapbox/components/site-error-boundary';
import {
  ModalContainer,
} from 'soapbox/features/ui/util/async-components';
import {
  useAppDispatch,
  useAppSelector,
  useLoggedIn,
  useOwnAccount,
  useSoapboxConfig,
} from 'soapbox/hooks';
import { useCachedLocationHandler } from 'soapbox/utils/redirect';

const GdprBanner = React.lazy(() => import('soapbox/components/gdpr-banner'));
const EmbeddedStatus = React.lazy(() => import('soapbox/features/embedded-status'));
const UI = React.lazy(() => import('soapbox/features/ui'));

/** Highest level node with the Redux store. */
const SoapboxMount = () => {
  useCachedLocationHandler();

  const { isLoggedIn } = useLoggedIn();
  const { account } = useOwnAccount();
  const dispatch = useAppDispatch();

  const soapboxConfig = useSoapboxConfig();

  const showCaptcha = account?.source?.ditto.captcha_solved === false;
  const needsOnboarding = useAppSelector(state => state.onboarding.needsOnboarding);
  const showOnboarding = account && needsOnboarding;

  useEffect(() => {
    if (showCaptcha) {
      dispatch(openModal('CAPTCHA'));
    }
  }, [showCaptcha]);

  if (showOnboarding) {
    dispatch(openModal('ONBOARDING_FLOW'));
  }

  const { redirectRootNoLogin, gdpr } = soapboxConfig;

  // @ts-ignore: I don't actually know what these should be, lol
  const shouldUpdateScroll = (prevRouterProps, { location }) => {
    return !(location.state?.soapboxModalKey && location.state?.soapboxModalKey !== prevRouterProps?.location?.state?.soapboxModalKey);
  };

  return (
    <SiteErrorBoundary>
      <BrowserRouter basename={BuildConfig.FE_SUBDIRECTORY}>
        <CompatRouter>
          <ScrollContext shouldUpdateScroll={shouldUpdateScroll}>
            <Switch>
              {(!isLoggedIn && redirectRootNoLogin) && (
                <Redirect exact from='/' to={redirectRootNoLogin} />
              )}

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
                <Suspense fallback={<LoadingScreen />}>
                  <UI />
                </Suspense>

                <Suspense>
                  <ModalContainer />
                </Suspense>

                {(gdpr && !isLoggedIn) && (
                  <Suspense>
                    <GdprBanner />
                  </Suspense>
                )}

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
    </SiteErrorBoundary>
  );
};

export default SoapboxMount;
