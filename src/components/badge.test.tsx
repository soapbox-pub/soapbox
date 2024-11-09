import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers';

import Badge from './badge';

describe('<Badge />', () => {
  it('renders correctly', () => {
    render(<Badge slug='patron' title='Patron' />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Patron');
  });
});
