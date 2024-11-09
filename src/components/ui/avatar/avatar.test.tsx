import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers';

import Avatar from './avatar';

const src = '/static/alice.jpg';

describe('<Avatar />', () => {
  it('renders', () => {
    render(<Avatar src={src} />);

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('handles size props', () => {
    render(<Avatar src={src} size={50} />);

    expect(screen.getByTestId('still-image-container').getAttribute('style')).toMatch(/50px/i);
  });
});
