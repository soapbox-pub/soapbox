import React from 'react';

import { storeOpen, storePepeOpen } from 'soapbox/jest/mock-stores';
import { render, screen } from 'soapbox/jest/test-helpers';

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
      render(<Navbar />, undefined, storeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('displays the signup button', () => {
      render(<Navbar />, undefined, storePepeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
