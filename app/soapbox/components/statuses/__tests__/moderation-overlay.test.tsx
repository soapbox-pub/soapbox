import React from 'react';

import { fireEvent, render, screen } from '../../../jest/test-helpers';
import ModerationOverlay from '../moderation-overlay';

describe('<ModerationOverlay />', () => {
  it('defaults to enabled', () => {
    render(<ModerationOverlay />);
    expect(screen.getByTestId('moderation-overlay')).toHaveTextContent('Content Under Review');
  });

  it('can be toggled', () => {
    render(<ModerationOverlay />);

    fireEvent.click(screen.getByTestId('button'));
    expect(screen.getByTestId('moderation-overlay')).not.toHaveTextContent('Content Under Review');
    expect(screen.getByTestId('moderation-overlay')).toHaveTextContent('Hide');
  });
});
