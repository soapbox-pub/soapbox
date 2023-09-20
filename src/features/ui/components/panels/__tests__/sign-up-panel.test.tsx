import React from 'react';

import { storeOpen, storePepeOpen } from 'soapbox/jest/mock-stores';
import { render, screen } from 'soapbox/jest/test-helpers';

import SignUpPanel from '../sign-up-panel';

describe('<SignUpPanel />', () => {
  it('doesn\'t render by default', () => {
    render(<SignUpPanel />);
    expect(screen.queryByTestId('sign-up-panel')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('successfully renders', () => {
      render(<SignUpPanel />, undefined, storeOpen);
      expect(screen.getByTestId('sign-up-panel')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('successfully renders', () => {
      render(<SignUpPanel />, undefined, storePepeOpen);
      expect(screen.getByTestId('sign-up-panel')).toBeInTheDocument();
    });
  });
});
