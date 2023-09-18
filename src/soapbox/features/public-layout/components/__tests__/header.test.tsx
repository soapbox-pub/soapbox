import React from 'react';

import { storeOpen, storePepeOpen } from 'soapbox/jest/mock-stores';
import { render, screen } from 'soapbox/jest/test-helpers';

import Header from '../header';

describe('<Header />', () => {
  it('successfully renders', () => {
    render(<Header />);
    expect(screen.getByTestId('public-layout-header')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<Header />);
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      render(<Header />, undefined, storeOpen);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('displays the signup button', () => {
      render(<Header />, undefined, storePepeOpen);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });
});