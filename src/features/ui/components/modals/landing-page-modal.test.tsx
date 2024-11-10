import { describe, expect, it } from 'vitest';

import { storeOpen } from 'soapbox/jest/mock-stores.tsx';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import LandingPageModal from './landing-page-modal.tsx';

describe('<LandingPageModal />', () => {
  it('successfully renders', () => {
    render(<LandingPageModal onClose={() => {}} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('doesn\'t display the signup button by default', () => {
    render(<LandingPageModal onClose={() => {}} />);
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  describe('with registrations enabled', () => {
    it('displays the signup button', () => {
      render(<LandingPageModal onClose={() => {}} />, undefined, storeOpen);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });
});
