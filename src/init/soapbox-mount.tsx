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
import { useInstance } from '@/hooks/useInstance.ts';
import { useLoggedIn } from '@/hooks/useLoggedIn.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';
import { useCachedLocationHandler } from '@/utils/redirect.ts';

const GdprBanner = lazy(() => import('@/components/gdpr-banner.tsx'));
const EmbeddedStatus = lazy(() => import('@/features/embedded-status/index.tsx'));
const StandaloneLanding = lazy(() => import('@/features/standalone/index.tsx'));
const UI = lazy(() => import('@/features/ui/index.tsx'));

/** Highest level node with the Redux store. */
const SoapboxMount = () => {
  useCachedLocationHandler();

  const { isLoggedIn } = useLoggedIn();
  const { account } = useOwnAccount();
  const { isNotFound } = useInstance();
  const dispatch = useAppDispatch();

  const soapboxConfig = useSoapboxConfig();

  const needsOnboarding = useAppSelector(state => state.onboarding.needsOnboarding);
  const showOnboarding = account && needsOnboarding;

  useEffect(() => {
    if (showOnboarding) {
      dispatch(openModal('ONBOARDING'));
    }
  }, [showOnboarding]);

  const { redirectRootNoLogin, gdpr } = soapboxConfig;

  return (
    <SiteErrorBoundary>
      <BrowserRouter>
        <CompatRouter>
          <ScrollContext>
            <Switch>
              {/* No backend behind us: let the user pick a server to sign in to. */}
              {(isNotFound && !isLoggedIn) && (
                <Route
                  path={['/', '/login/external']}
                  exact
                  render={() => (
                    <Suspense fallback={<LoadingScreen />}>
                      <StandaloneLanding />
                    </Suspense>
                  )}
                />
              )}

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
