/** Infinite async generator. Iterates messages pushed to it until closed. */
class Machina<T> {

  #resolve: ((data: T) => void) | undefined;
  #reject: ((reason?: unknown) => void) | undefined;

  async * stream(): AsyncGenerator<T> {
    while (true) {
      try {
        // eslint-disable-next-line no-loop-func
        yield await new Promise<T>((_resolve, _reject) => {
          this.#resolve = _resolve;
          this.#reject = _reject;
        });
      } catch (_e) {
        break;
      }
    }
  }

  push(data: T): void {
    this.#resolve?.(data);
  }

  close(): void {
    this.#reject?.();
  }

}

export { Machina };