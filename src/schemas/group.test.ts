import { expect, test } from 'vitest';

import { groupSchema } from './group';

test('groupSchema with a TruthSocial group', async () => {
  const data = await import('soapbox/__fixtures__/group-truthsocial.json');
  const group = groupSchema.parse(data);
  expect(group.display_name_html).toEqual('PATRIOT PATRIOTS');
});