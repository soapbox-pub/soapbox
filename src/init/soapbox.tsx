import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

import { NostrProvider } from 'soapbox/contexts/nostr-context';
import { StatProvider } from 'soapbox/contexts/stat-context';
import { createGlobals } from 'soapbox/globals';
import { queryClient } from 'soapbox/queries/client';

import { checkOnboardingStatus } from '../actions/onboarding';
import { preload } from '../actions/preload';
import { store } from '../store';

import SoapboxHead from './soapbox-head';
import SoapboxLoad from './soapbox-load';
import SoapboxMount from './soapbox-mount';

// Configure global functions for developers
createGlobals(store);

// Preload happens synchronously
store.dispatch(preload() as any);

// This happens synchronously
store.dispatch(checkOnboardingStatus() as any);

/** The root React node of the application. */
const Soapbox: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StatProvider>
          <NostrProvider>
            <SoapboxHead>
              <SoapboxLoad>
                <SoapboxMount />
              </SoapboxLoad>
            </SoapboxHead>
          </NostrProvider>
        </StatProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default Soapbox;
