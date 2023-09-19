import { linearAlgorithm } from '../linear';

const DATA = Object.freeze(['a', 'b', 'c', 'd']);

test('linearAlgorithm', () => {
  const result = Array(50).fill('').map((_, i) => {
    return linearAlgorithm(DATA, i, { interval: 5 });
  });

  // console.log(result);
  expect(result[0]).toBe(undefined);
  expect(result[4]).toBe('a');
  expect(result[8]).toBe(undefined);
  expect(result[9]).toBe('b');
  expect(result[10]).toBe(undefined);
  expect(result[14]).toBe('c');
  expect(result[15]).toBe(undefined);
  expect(result[19]).toBe('d');
});