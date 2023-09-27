import { Pubsub } from './pubsub';

test('subscribe & publish', async () => {
  const results: number[] = [];
  const pubsub = new Pubsub<number>();

  const sub = pubsub.subscribe('test');
  setTimeout(() => pubsub.publish('test', 1), 100);
  setTimeout(() => pubsub.publish('test', 2), 200);
  setTimeout(() => pubsub.publish('test', 3), 300);

  for await (const msg of sub.stream()) {
    results.push(msg);

    if (results.length === 3) {
      sub.close();
    }
  }

  expect(results).toEqual([1, 2, 3]);
});