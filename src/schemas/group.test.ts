import { expect, test } from 'vitest';

import { groupSchema } from './group.ts';

test('groupSchema with a TruthSocial group', async () => {
  const data = await import('@/__fixtures__/group-truthsocial.json');
  const group = groupSchema.parse(data);
  expect(group.display_name).toEqual('PATRIOT PATRIOTS');
});
test('groupSchema replaces non-web avatar and header URLs', async () => {
  const data = await import('@/__fixtures__/group-truthsocial.json');
  const group = groupSchema.parse({ ...data.default, avatar: 'javascript:alert(1)', avatar_static: '', header: 'javascript:alert(2)', header_static: '' });

  expect(group.avatar).not.toContain('javascript:');
  expect(group.header).not.toContain('javascript:');
  expect(group.avatar_static).toBe(group.avatar);
  expect(group.header_static).toBe(group.header);
});
