/** Infinite async generator. Iterates messages pushed to it until closed. */
class Machina<T> {

  #open = true;
  #queue: T[] = [];
  #resolve: (() => void) | undefined;

  async * stream(): AsyncGenerator<T> {
    this.#open = true;

    while (this.#open) {
      if (this.#queue.length) {
        yield this.#queue.shift()!;
        continue;
      }

      await new Promise<void>((_resolve) => {
        this.#resolve = _resolve;
      });
    }
  }

  push(data: T): void {
    this.#queue.push(data);
    this.#resolve?.();
  }

  close(): void {
    this.#open = false;
    this.#resolve?.();
  }

}

export { Machina };