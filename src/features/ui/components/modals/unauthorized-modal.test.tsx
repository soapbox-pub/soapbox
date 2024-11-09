import { describe, expect, it } from 'vitest';

import { storeOpen } from 'soapbox/jest/mock-stores';
import { render, screen } from 'soapbox/jest/test-helpers';

import UnauthorizedModal from './unauthorized-modal';

describe('<UnauthorizedModal />', () => {
  it('successfully renders', () => {
    render(<UnauthorizedModal onClose={() => {}} action='FOLLOW' />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<UnauthorizedModal onClose={() => {}} action='FOLLOW' />);
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      render(<UnauthorizedModal onClose={() => {}} action='FOLLOW' />, undefined, storeOpen);
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });
});
