import { Machina } from './machina';

interface Sub<T> {
  stream(): AsyncGenerator<T>
  close(): void
}

class Pubsub<T> {

  #subscribers = new Map<string, Set<Machina<T>>>();

  subscribe(topic: string): Sub<T> {
    if (!this.#subscribers.has(topic)) {
      this.#subscribers.set(topic, new Set<Machina<T>>());
    }

    const machina = new Machina<T>();
    this.#subscribers.get(topic)!.add(machina);

    return {
      stream: () => machina.stream(),
      close: () => {
        this.#subscribers.get(topic)?.delete(machina);
        machina.close();
      },
    };
  }

  publish(topic: string, data: T): void {
    if (!this.#subscribers.has(topic)) return;

    for (const machina of this.#subscribers.get(topic)!) {
      machina.push(data);
    }
  }

  close(): void {
    for (const subscribers of this.#subscribers.values()) {
      for (const machina of subscribers) {
        machina.close();
      }
    }

    this.#subscribers.clear();
  }

}

export { Pubsub, type Sub };