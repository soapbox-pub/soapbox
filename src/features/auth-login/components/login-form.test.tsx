import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from 'soapbox/jest/test-helpers.tsx';
import { instanceV1Schema } from 'soapbox/schemas/instance.ts';

import LoginForm from './login-form.tsx';

describe('<LoginForm />', () => {
  it('renders for Pleroma', () => {
    const mockFn = vi.fn();
    const store = {
      instance: instanceV1Schema.parse({
        version: '2.7.2 (compatible; Pleroma 2.3.0)',
      }),
    };

    render(<LoginForm handleSubmit={mockFn} isLoading={false} />, undefined, store);

    expect(screen.getByRole('heading')).toHaveTextContent(/sign in/i);
  });

  it('renders for Mastodon', () => {
    const mockFn = vi.fn();
    const store = {
      instance: instanceV1Schema.parse({
        version: '3.0.0',
      }),
    };

    render(<LoginForm handleSubmit={mockFn} isLoading={false} />, undefined, store);

    expect(screen.getByRole('heading')).toHaveTextContent(/sign in/i);
  });

  it('responds to the handleSubmit prop', () => {
    const mockFn = vi.fn();
    render(<LoginForm handleSubmit={mockFn} isLoading={false} />);
    fireEvent.submit(screen.getByTestId(/button/i));

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
