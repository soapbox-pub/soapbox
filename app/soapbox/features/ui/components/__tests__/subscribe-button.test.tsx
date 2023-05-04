import React from 'react';

import { buildRelationship } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';
import { normalizeAccount } from 'soapbox/normalizers';

import SubscribeButton from '../subscription-button';

import type { ReducerAccount } from 'soapbox/reducers/accounts';

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
      const account = normalizeAccount({ ...justin, relationship: buildRelationship({ following: true }) }) as ReducerAccount;

      render(<SubscribeButton account={account} />, undefined, store);
      expect(screen.queryAllByTestId('icon-button')).toHaveLength(0);
    });
  });
});
