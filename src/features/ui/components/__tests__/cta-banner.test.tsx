import React from 'react';

import { storeClosed, storeLoggedIn, storeOpen, storePepeOpen } from 'soapbox/jest/mock-stores';

import { render, screen } from '../../../../jest/test-helpers';
import CtaBanner from '../cta-banner';

describe('<CtaBanner />', () => {
  it('renders the banner', () => {
    render(<CtaBanner />, undefined, storeOpen);
    expect(screen.getByTestId('cta-banner')).toHaveTextContent(/sign up/i);
  });

  describe('with a logged in user', () => {
    it('renders empty', () => {
      render(<CtaBanner />, undefined, storeLoggedIn);
      expect(screen.queryAllByTestId('cta-banner')).toHaveLength(0);
    });
  });

  describe('with registrations closed', () => {
    it('renders empty', () => {
      render(<CtaBanner />, undefined, storeClosed);
      expect(screen.queryAllByTestId('cta-banner')).toHaveLength(0);
    });
  });

  describe('with Pepe enabled', () => {
    it('renders the banner', () => {
      render(<CtaBanner />, undefined, storePepeOpen);
      expect(screen.getByTestId('cta-banner')).toHaveTextContent(/sign up/i);
    });
  });
});
