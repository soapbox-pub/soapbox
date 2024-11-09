
import IconCode from '@tabler/icons/outline/code.svg';
import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers';

import SvgIcon from './svg-icon';

describe('<SvgIcon />', () => {
  it('renders loading element with default size', async () => {
    render(<SvgIcon className='text-primary-500' src={IconCode} />);

    const svg = screen.getByTestId('svg-icon-loader');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
    expect(svg.getAttribute('class')).toBe('text-primary-500');
  });
});
