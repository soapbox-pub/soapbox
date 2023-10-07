import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Provider } from 'react-redux';

import { StatProvider } from 'soapbox/contexts/stat-context';
import { queryClient } from 'soapbox/queries/client';

import { store } from '../store';

import SoapboxHead from './soapbox-head';
import SoapboxLoad from './soapbox-load';
import SoapboxMount from './soapbox-mount';

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
