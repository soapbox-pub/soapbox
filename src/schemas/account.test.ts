import { describe, expect, it } from 'vitest';

import { accountSchema } from './account.ts';

describe('accountSchema', () => {
  it('sanitizes profile field values', () => {
    const account = accountSchema.parse({
      id: '1',
      acct: 'alex',
      url: 'https://example.com/@alex',
      fields: [{
        name: 'Website',
        value: '<a href="javascript:alert(1)">click</a> <a href="https://example.com" rel="me">example.com</a><img src=x onerror=alert(2)>',
      }],
    });

    expect(account.fields[0]?.value).toEqual('<a>click</a> <a rel="me" href="https://example.com">example.com</a><img src="x">');
  });
});
