import { expect, test } from 'vitest';

import config_db from '@/__fixtures__/config_db.json';

import { ConfigDB } from './config-db.ts';

test('find', () => {
  const configs = config_db.configs;
  expect(ConfigDB.find(configs, ':phoenix', ':json_library')).toEqual({
    group: ':phoenix',
    key: ':json_library',
    value: 'Jason',
  });
});
