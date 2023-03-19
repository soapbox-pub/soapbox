import { deleteEntities, entitiesFetchFail, entitiesFetchRequest, importEntities } from '../actions';
import reducer, { State } from '../reducer';
import { createListState } from '../utils';

import type { EntityCache } from '../types';

interface TestEntity {
  id: string
  msg: string
}

test('import entities', () => {
  const entities: TestEntity[] = [
    { id: '1', msg: 'yolo' },
    { id: '2', msg: 'benis' },
    { id: '3', msg: 'boop' },
  ];

  const action = importEntities(entities, 'TestEntity');
  const result = reducer(undefined, action);
  const cache = result.TestEntity as EntityCache<TestEntity>;

  expect(cache.store['1']!.msg).toBe('yolo');
  expect(Object.values(cache.lists).length).toBe(0);
});

test('import entities into a list', () => {
  const entities: TestEntity[] = [
    { id: '1', msg: 'yolo' },
    { id: '2', msg: 'benis' },
    { id: '3', msg: 'boop' },
  ];

  const action = importEntities(entities, 'TestEntity', 'thingies');
  const result = reducer(undefined, action);
  const cache = result.TestEntity as EntityCache<TestEntity>;

  expect(cache.store['2']!.msg).toBe('benis');
  expect(cache.lists.thingies?.ids.size).toBe(3);

  // Now try adding an additional item.
  const entities2: TestEntity[] = [
    { id: '4', msg: 'hehe' },
  ];

  const action2 = importEntities(entities2, 'TestEntity', 'thingies');
  const result2 = reducer(result, action2);
  const cache2 = result2.TestEntity as EntityCache<TestEntity>;

  expect(cache2.store['4']!.msg).toBe('hehe');
  expect(cache2.lists.thingies?.ids.size).toBe(4);

  // Finally, update an item.
  const entities3: TestEntity[] = [
    { id: '2', msg: 'yolofam' },
  ];

  const action3 = importEntities(entities3, 'TestEntity', 'thingies');
  const result3 = reducer(result2, action3);
  const cache3 = result3.TestEntity as EntityCache<TestEntity>;

  expect(cache3.store['2']!.msg).toBe('yolofam');
  expect(cache3.lists.thingies?.ids.size).toBe(4); // unchanged
});

test('fetching updates the list state', () => {
  const action = entitiesFetchRequest('TestEntity', 'thingies');
  const result = reducer(undefined, action);

  expect(result.TestEntity!.lists.thingies!.state.fetching).toBe(true);
});

test('failure adds the error to the state', () => {
  const error = new Error('whoopsie');

  const action = entitiesFetchFail('TestEntity', 'thingies', error);
  const result = reducer(undefined, action);

  expect(result.TestEntity!.lists.thingies!.state.error).toBe(error);
});

test('deleting items', () => {
  const state: State = {
    TestEntity: {
      store: { '1': { id: '1' }, '2': { id: '2' }, '3': { id: '3' } },
      lists: {
        '': {
          ids: new Set(['1', '2', '3']),
          state: createListState(),
        },
      },
    },
  };

  const action = deleteEntities(['3', '1'], 'TestEntity');
  const result = reducer(state, action);

  expect(result.TestEntity!.store).toMatchObject({ '2': { id: '2' } });
  expect([...result.TestEntity!.lists['']!.ids]).toEqual(['2']);
});