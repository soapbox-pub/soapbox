import { groupSchema } from '../group';

test('groupSchema with a TruthSocial group', () => {
  const data = require('soapbox/__fixtures__/group-truthsocial.json');
  const group = groupSchema.parse(data);
  expect(group.display_name_html).toEqual('PATRIOT PATRIOTS');
});