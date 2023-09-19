import React from 'react';

import { rememberInstance } from 'soapbox/actions/instance';
import { render, screen, rootReducer } from 'soapbox/jest/test-helpers';

import LandingPage from '..';

describe('<LandingPage />', () => {
  it('renders a RegistrationForm for an open Pleroma instance', () => {

    const state = rootReducer(undefined, {
      type: rememberInstance.fulfilled.type,
      payload: {
        version: '2.7.2 (compatible; Pleroma 2.3.0)',
        registrations: true,
      },
    });

    render(<LandingPage />, undefined, state);

    expect(screen.queryByTestId('registrations-open')).toBeInTheDocument();
    expect(screen.queryByTestId('registrations-closed')).not.toBeInTheDocument();
  });

  it('renders "closed" message for a closed Pleroma instance', () => {

    const state = rootReducer(undefined, {
      type: rememberInstance.fulfilled.type,
      payload: {
        version: '2.7.2 (compatible; Pleroma 2.3.0)',
        registrations: false,
      },
    });

    render(<LandingPage />, undefined, state);

    expect(screen.queryByTestId('registrations-closed')).toBeInTheDocument();
    expect(screen.queryByTestId('registrations-open')).not.toBeInTheDocument();
  });
});
