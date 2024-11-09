import React from 'react';
import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers';

import { Column } from './column';

describe('<Column />', () => {
  it('renders correctly with minimal props', () => {
    render(<Column />);

    expect(screen.getByRole('button')).toHaveTextContent('Back');
  });
});
