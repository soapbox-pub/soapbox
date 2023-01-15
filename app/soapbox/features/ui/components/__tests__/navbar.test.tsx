import { fromJS } from 'immutable';
import React from 'react';

import { render, screen } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import Navbar from '../navbar';

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
      const store = { instance: normalizeInstance({ registrations: true }) };
      render(<Navbar />, undefined, store);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('displays the signup button', () => {
      const store = {
        instance: normalizeInstance({ registrations: false }),
        soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
        verification: { instance: fromJS({ registrations: true }) },
      };

      render(<Navbar />, undefined, store);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
