import { describe, expect, it } from 'vitest';

import { storeOpen } from 'soapbox/jest/mock-stores.tsx';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import Navbar from './navbar.tsx';

describe('<Navbar />', () => {
  it('successfully renders', () => {
    render(<Navbar />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<Navbar />);
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      render(<Navbar />, undefined, storeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
