import { accountSchema } from 'soapbox/schemas';

import {
  getDomain,
} from '../accounts';

describe('getDomain', () => {
  const account = accountSchema.parse({
    id: '1',
    acct: 'alice',
    url: 'https://party.com/users/alice',
  });

  it('returns the domain', () => {
    expect(getDomain(account)).toEqual('party.com');
  });
});
