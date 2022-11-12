import { abovefoldAlgorithm } from '../abovefold';

const DATA = Object.freeze(['a', 'b', 'c', 'd']);

test('abovefoldAlgorithm', () => {
  const result = Array(50).fill('').map((_, i) => {
    return abovefoldAlgorithm(DATA, i, { seed: '!', range: [2, 6], pageSize: 20 });
  });

  // console.log(result);
  expect(result[0]).toBe(undefined);
  expect(result[4]).toBe('a');
  expect(result[5]).toBe(undefined);
  expect(result[24]).toBe('b');
  expect(result[30]).toBe(undefined);
  expect(result[42]).toBe('c');
  expect(result[43]).toBe(undefined);
});