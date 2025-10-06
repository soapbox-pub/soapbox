import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';

import { openModal } from '@/actions/modals.ts';
import LoadingScreen from '@/components/loading-screen.tsx';
import { ScrollContext } from '@/components/scroll-context.tsx';
import SiteErrorBoundary from '@/components/site-error-boundary.tsx';
import { ModalContainer } from '@/features/ui/util/async-components.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useLoggedIn } from '@/hooks/useLoggedIn.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';
import { useCachedLocationHandler } from '@/utils/redirect.ts';

const GdprBanner = lazy(() => import('@/components/gdpr-banner.tsx'));
const EmbeddedStatus = lazy(() => import('@/features/embedded-status/index.tsx'));
const UI = lazy(() => import('@/features/ui/index.tsx'));

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

  useEffect(() => {
    if (showOnboarding && !showCaptcha) {
      dispatch(openModal('ONBOARDING'));
    }
  }, [showOnboarding, showCaptcha]);

  const { redirectRootNoLogin, gdpr } = soapboxConfig;

  return (
    <SiteErrorBoundary>
      <BrowserRouter>
        <CompatRouter>
          <ScrollContext>
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
