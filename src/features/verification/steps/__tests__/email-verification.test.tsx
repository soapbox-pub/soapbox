import userEvent from '@testing-library/user-event';
import React from 'react';

import { __stub } from 'soapbox/api';
import { fireEvent, render, screen, waitFor } from 'soapbox/jest/test-helpers';

import EmailVerification from '../email-verification';

describe('<EmailVerification />', () => {
  it('successfully renders the Email step', async() => {
    render(<EmailVerification />);
    expect(screen.getByRole('heading')).toHaveTextContent('Enter your email address');
  });

  describe('with valid data', () => {
    beforeEach(() => {
      __stub(mock => {
        mock.onPost('/api/v1/pepe/verify_email/request')
          .reply(200, {});
      });
    });

    it('successfully submits', async() => {
      render(<EmailVerification />);

      await userEvent.type(screen.getByLabelText('E-mail address'), 'foo@bar.com{enter}');

      await waitFor(() => {
        fireEvent.submit(
          screen.getByTestId('button'), {
            preventDefault: () => {},
          },
        );
      });

      expect(screen.getByTestId('button')).toHaveTextContent('Resend verification email');
    });
  });

  describe('with invalid data', () => {
    beforeEach(() => {
      __stub(mock => {
        mock.onPost('/api/v1/pepe/verify_email/request')
          .reply(422, {
            error: 'email_taken',
          });
      });
    });

    it('renders errors', async() => {
      render(<EmailVerification />);

      await userEvent.type(screen.getByLabelText('E-mail address'), 'foo@bar.com{enter}');

      await waitFor(() => {
        fireEvent.submit(
          screen.getByTestId('button'), {
            preventDefault: () => {},
          },
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('form-group-error')).toHaveTextContent('is taken');
      });
    });
  });
});
