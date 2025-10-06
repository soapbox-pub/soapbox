import { describe, expect, it } from 'vitest';

import { render, screen } from '@/jest/test-helpers.tsx';

import { Column } from './column.tsx';

describe('<Column />', () => {
  it('renders correctly with minimal props', () => {
    render(<Column />);

    expect(screen.getByRole('button')).toHaveTextContent('Back');
  });
});
