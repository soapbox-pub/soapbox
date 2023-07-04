import React from 'react';

import { buildAccount } from 'soapbox/jest/factory';

import { render, screen } from '../../jest/test-helpers';
import DisplayName from '../display-name';

describe('<DisplayName />', () => {
  it('renders display name + account name', () => {
    const account = buildAccount({ acct: 'bar@baz' });
    render(<DisplayName account={account} />);

    expect(screen.getByTestId('display-name')).toHaveTextContent('bar@baz');
  });
});
