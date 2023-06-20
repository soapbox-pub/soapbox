import React from 'react';

import { buildAccount, buildRelationship } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';

import SubscribeButton from '../subscription-button';

const justin = {
  id: '1',
  acct: 'justin-username',
  display_name: 'Justin L',
  avatar: 'test.jpg',
};

describe('<SubscribeButton />', () => {
  let store: any;

  describe('with "accountNotifies" disabled', () => {
    it('renders nothing', () => {
      const account = buildAccount({ ...justin, relationship: buildRelationship({ following: true }) });

      render(<SubscribeButton account={account} />, undefined, store);
      expect(screen.queryAllByTestId('icon-button')).toHaveLength(0);
    });
  });
});
