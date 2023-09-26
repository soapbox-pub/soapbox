import { Machina } from './machina';

async function * messages(socket: WebSocket, signal: AbortSignal): AsyncGenerator<MessageEvent> {
  const machina = new Machina<MessageEvent>();

  socket.addEventListener('message', handleMessage);
  socket.addEventListener('close', handleClose);
  signal.addEventListener('abort', handleClose);

  function handleMessage(ev: MessageEvent): void {
    machina.push(ev);
  }

  function handleClose(): void {
    machina.close();
  }

  for await (const msg of machina.stream()) {
    yield msg;
  }

  socket.removeEventListener('message', handleMessage);
  socket.removeEventListener('close', handleClose);
  signal.removeEventListener('abort', handleClose);
}

const AsyncSocket = {
  messages,
};

export { AsyncSocket };