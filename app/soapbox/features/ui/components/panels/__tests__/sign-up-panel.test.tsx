import { fromJS } from 'immutable';
import React from 'react';

import { render, screen } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import SignUpPanel from '../sign-up-panel';

describe('<SignUpPanel />', () => {
  it('doesn\'t render by default', () => {
    render(<SignUpPanel />);
    expect(screen.queryByTestId('sign-up-panel')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('successfully renders', () => {
      const store = { instance: normalizeInstance({ registrations: true }) };
      render(<SignUpPanel />, undefined, store);
      expect(screen.getByTestId('sign-up-panel')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('successfully renders', () => {
      const store = {
        instance: normalizeInstance({ registrations: false }),
        soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
        verification: { instance: fromJS({ registrations: true }) },
      };

      render(<SignUpPanel />, undefined, store);
      expect(screen.getByTestId('sign-up-panel')).toBeInTheDocument();
    });
  });
});
