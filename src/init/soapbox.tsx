import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

import { NostrProvider } from 'soapbox/contexts/nostr-context.tsx';
import { StatProvider } from 'soapbox/contexts/stat-context.tsx';
import { queryClient } from 'soapbox/queries/client.ts';

import { checkOnboardingStatus } from '../actions/onboarding.ts';
import { preload } from '../actions/preload.ts';
import { store } from '../store.ts';

import SoapboxHead from './soapbox-head.tsx';
import SoapboxLoad from './soapbox-load.tsx';
import SoapboxMount from './soapbox-mount.tsx';

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
