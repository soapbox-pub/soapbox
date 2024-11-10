import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import OtpAuthForm from './otp-auth-form.tsx';

describe('<OtpAuthForm />', () => {
  it('renders correctly', () => {
    render(<OtpAuthForm mfa_token={'12345'} />);

    expect(screen.getByRole('heading')).toHaveTextContent('OTP Login');
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });
});
