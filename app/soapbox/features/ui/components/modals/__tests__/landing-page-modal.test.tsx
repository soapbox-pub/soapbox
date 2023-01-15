import { fromJS } from 'immutable';
import React from 'react';

import { render, screen } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import LandingPageModal from '../landing-page-modal';

describe('<LandingPageModal />', () => {
  it('successfully renders', () => {
    render(<LandingPageModal onClose={jest.fn} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<LandingPageModal onClose={jest.fn} />);
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      const store = { instance: normalizeInstance({ registrations: true }) };
      render(<LandingPageModal onClose={jest.fn} />, undefined, store);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('displays the signup button', () => {
      const store = {
        instance: normalizeInstance({ registrations: false }),
        soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
        verification: { instance: fromJS({ registrations: true }) },
      };

      render(<LandingPageModal onClose={jest.fn} />, undefined, store);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });
});
