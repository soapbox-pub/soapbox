async function * messages(socket: WebSocket, signal: AbortSignal): AsyncGenerator<MessageEvent> {
  let resolve: ((ev: MessageEvent) => void) | undefined;
  let reject: ((reason?: unknown) => void) | undefined;

  socket.addEventListener('message', handleMessage);
  socket.addEventListener('close', handleClose);
  signal.addEventListener('abort', handleClose);

  function handleMessage(ev: MessageEvent): void {
    resolve?.(ev);
  }

  function handleClose(): void {
    reject?.();
  }

  while (!signal.aborted) {
    try {
      // eslint-disable-next-line no-loop-func
      yield await new Promise<MessageEvent>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
    } catch (_e) {
      break;
    }
  }

  socket.removeEventListener('message', handleMessage);
  socket.removeEventListener('close', handleClose);
  signal.removeEventListener('abort', handleClose);
}

const AsyncSocket = {
  messages,
};

export { AsyncSocket };