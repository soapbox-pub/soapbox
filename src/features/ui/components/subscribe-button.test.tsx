import { describe, expect, it } from 'vitest';

import { buildAccount, buildRelationship } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import SubscribeButton from './subscription-button.tsx';

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
