import userEvent from '@testing-library/user-event';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { toast } from 'react-hot-toast';

import { __stub } from 'soapbox/api';
import { fireEvent, render, screen, waitFor } from 'soapbox/jest/test-helpers';

import SmsVerification from '../sms-verification';

describe('<SmsVerification />', () => {
  it('successfully renders the SMS step', async() => {
    render(<SmsVerification />);
    expect(screen.getByRole('heading')).toHaveTextContent('Enter your phone number');
  });

  describe('with valid data', () => {
    beforeEach(() => {
      __stub(mock => {
        mock.onPost('/api/v1/pepe/verify_sms/request').reply(200, {});
      });
    });

    it('successfully submits', async() => {
      __stub(mock => {
        mock.onPost('/api/v1/pepe/verify_sms/confirm').reply(200, {});
      });

      render(<SmsVerification />);

      await userEvent.type(screen.getByLabelText('Phone number'), '+1 (555) 555-5555');
      await waitFor(() => {
        fireEvent.submit(
          screen.getByRole('button', { name: 'Next' }), {
            preventDefault: () => {},
          },
        );
      });

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('Verification code');
        expect(screen.getByTestId('toast')).toHaveTextContent('A verification code has been sent to your phone number.');
      });

      act(() => {
        toast.remove();
      });

      await userEvent.type(screen.getByLabelText('Please enter verification code. Digit 1'), '1');
      await userEvent.type(screen.getByLabelText('Digit 2'), '2');
      await userEvent.type(screen.getByLabelText('Digit 3'), '3');
      await userEvent.type(screen.getByLabelText('Digit 4'), '4');
      await userEvent.type(screen.getByLabelText('Digit 5'), '5');
      await userEvent.type(screen.getByLabelText('Digit 6'), '6');
    });

    it('handle expired tokens', async() => {
      __stub(mock => {
        mock.onPost('/api/v1/pepe/verify_sms/confirm').reply(422, {});
      });

      render(<SmsVerification />);

      await userEvent.type(screen.getByLabelText('Phone number'), '+1 (555) 555-5555');
      await waitFor(() => {
        fireEvent.submit(
          screen.getByRole('button', { name: 'Next' }), {
            preventDefault: () => {},
          },
        );
      });

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('Verification code');
        expect(screen.getByTestId('toast')).toHaveTextContent('A verification code has been sent to your phone number.');
      });

      act(() => {
        toast.remove();
      });

      await userEvent.type(screen.getByLabelText('Please enter verification code. Digit 1'), '1');
      await userEvent.type(screen.getByLabelText('Digit 2'), '2');
      await userEvent.type(screen.getByLabelText('Digit 3'), '3');
      await userEvent.type(screen.getByLabelText('Digit 4'), '4');
      await userEvent.type(screen.getByLabelText('Digit 5'), '5');
      await userEvent.type(screen.getByLabelText('Digit 6'), '6');

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveTextContent('Your SMS token has expired.');
      });
    });
  });

  describe('with invalid data', () => {
    beforeEach(() => {
      __stub(mock => {
        mock.onPost('/api/v1/pepe/verify_sms/request')
          .reply(422, {});
      });
    });

    it('renders errors', async() => {
      render(<SmsVerification />);

      await userEvent.type(screen.getByLabelText('Phone number'), '+1 (555) 555-5555');
      await waitFor(() => {
        fireEvent.submit(
          screen.getByRole('button', { name: 'Next' }), {
            preventDefault: () => {},
          },
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveTextContent('Failed to send SMS message to your phone number.');
      });
    });
  });
});
