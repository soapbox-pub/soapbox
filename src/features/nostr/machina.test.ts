import { Machina } from './machina';

test('push, iterate, & close', async () => {
  const results = [];
  const machina = new Machina<number>();

  machina.push(1);
  machina.push(2);
  setTimeout(() => machina.push(3), 100);

  for await (const msg of machina.stream()) {
    results.push(msg);

    if (results.length === 3) {
      machina.close();
    }
  }

  expect(results).toEqual([1, 2, 3]);
});

test('close & reopen', async () => {
  const machina = new Machina<number>();

  machina.push(777);
  for await (const msg of machina.stream()) {
    expect(msg).toEqual(777);
    machina.close();
  }

  machina.push(888);
  for await (const msg of machina.stream()) {
    expect(msg).toEqual(888);
    machina.close();
  }
});