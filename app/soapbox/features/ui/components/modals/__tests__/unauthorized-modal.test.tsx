import React from 'react';

import { storeOpen, storePepeOpen } from 'soapbox/jest/mock-stores';
import { render, screen } from 'soapbox/jest/test-helpers';

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
      render(<UnauthorizedModal onClose={jest.fn} action='FOLLOW' />, undefined, storeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('with registrations closed, Pepe enabled', () => {
    it('displays the signup button', () => {
      render(<UnauthorizedModal onClose={jest.fn} action='FOLLOW' />, undefined, storePepeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
