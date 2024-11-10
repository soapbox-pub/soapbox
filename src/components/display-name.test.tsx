import { describe, expect, it } from 'vitest';

import { buildAccount } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import DisplayName from './display-name.tsx';

describe('<DisplayName />', () => {
  it('renders display name + account name', () => {
    const account = buildAccount({ acct: 'bar@baz' });
    render(<DisplayName account={account} />);

    expect(screen.getByTestId('display-name')).toHaveTextContent('bar@baz');
  });
});
