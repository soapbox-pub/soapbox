import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { buildAccount } from 'soapbox/jest/factory';

import { render, screen, waitFor } from '../../../jest/test-helpers';
import { normalizeInstance } from '../../../normalizers';
import UI from '../index';
import { WrappedRoute } from '../util/react-router-helpers';

const TestableComponent = () => (
  <Switch>
    <Route path='/@:username/posts/:statusId' exact><UI /></Route>
    <Route path='/@:username/media' exact><UI /></Route>
    <Route path='/@:username' exact><UI /></Route>
    <Route path='/login' exact><span data-testid='sign-in'>Sign in</span></Route>

    {/* WrappedRount will redirect to /login for logged out users... which will resolve to the route above! */}
    <WrappedRoute path='/notifications' component={() => null} />
  </Switch>
);

describe('<UI />', () => {
  let store: any;

  beforeEach(() => {
    store = {
      me: false,
      accounts: {
        '1': buildAccount({
          id: '1',
          acct: 'username',
          display_name: 'My name',
          avatar: 'test.jpg',
        }),
      },
      instance: normalizeInstance({ registrations: true }),
    };
  });

  describe('when logged out', () => {
    describe('when viewing a Profile Page', () => {
      it('should render the Profile page', async() => {
        render(
          <TestableComponent />,
          {},
          store,
          { initialEntries: ['/@username'] },
        );

        await waitFor(() => {
          expect(screen.getByTestId('cta-banner')).toHaveTextContent('Sign up now to discuss');
        }, {
          timeout: 5000,
        });
      });
    });

    describe('when viewing a Status Page', () => {
      it('should render the Status page', async() => {
        render(
          <TestableComponent />,
          {},
          store,
          { initialEntries: ['/@username/posts/12'] },
        );

        await waitFor(() => {
          expect(screen.getByTestId('cta-banner')).toHaveTextContent('Sign up now to discuss');
        });
      });
    });

    describe('when viewing Notifications', () => {
      it('should redirect to the login page', async() => {
        render(
          <TestableComponent />,
          {},
          store,
          { initialEntries: ['/notifications'] },
        );

        await waitFor(() => {
          expect(screen.getByTestId('sign-in')).toHaveTextContent('Sign in');
        });
      });
    });
  });
});
