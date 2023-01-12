import React from 'react';

import { normalizeInstance } from 'soapbox/normalizers';

import { render, screen } from '../../../../jest/test-helpers';
import CtaBanner from '../cta-banner';

describe('<CtaBanner />', () => {
  it('renders the banner', () => {
    const store = { instance: normalizeInstance({ registrations: true }) };

    render(<CtaBanner />, undefined, store);
    expect(screen.getByTestId('cta-banner')).toHaveTextContent(/sign up/i);
  });

  describe('with a logged in user', () => {
    it('renders empty', () => {
      const store = { me: true };

      render(<CtaBanner />, undefined, store);
      expect(screen.queryAllByTestId('cta-banner')).toHaveLength(0);
    });
  });

  describe('with registrations closed', () => {
    it('renders empty', () => {
      const store = { instance: normalizeInstance({ registrations: false }) };

      render(<CtaBanner />, undefined, store);
      expect(screen.queryAllByTestId('cta-banner')).toHaveLength(0);
    });
  });
});
