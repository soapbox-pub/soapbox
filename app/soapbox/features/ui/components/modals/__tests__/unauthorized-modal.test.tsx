import { fromJS } from 'immutable';
import React from 'react';

import { render, screen } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import UnauthorizedModal from '../unauthorized-modal';

describe('<UnauthorizedModal />', () => {
  it('successfully renders', () => {
    render(<UnauthorizedModal onClose={jest.fn} action='FOLLOW' />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<UnauthorizedModal onClose={jest.fn} action='FOLLOW' />);
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      const store = { instance: normalizeInstance({ registrations: true }) };
      render(<UnauthorizedModal onClose={jest.fn} action='FOLLOW' />, undefined, store);
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

      render(<UnauthorizedModal onClose={jest.fn} action='FOLLOW' />, undefined, store);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
