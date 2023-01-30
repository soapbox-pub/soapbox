import React from 'react';

import { storeOpen, storePepeOpen } from 'soapbox/jest/mock-stores';
import { render, screen } from 'soapbox/jest/test-helpers';

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
      render(<LandingPageModal onClose={jest.fn} />, undefined, storeOpen);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('displays the signup button', () => {
      render(<LandingPageModal onClose={jest.fn} />, undefined, storePepeOpen);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });
});
