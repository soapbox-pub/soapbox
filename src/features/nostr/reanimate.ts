/** Function that calculates the wait time between reconnection attempts. */
type Backoff = (attempt: number, delay: number) => number;

/** Exponential backoff function. */
const exponential: Backoff = (attempt, delay) => {
  return Math.floor(Math.random() * Math.pow(2, attempt) * delay);
};

/** Fibonacci backoff function. */
const fibonacci: Backoff = (attempt, delay) => {
  if (attempt <= 1) return delay;

  let prev = 0, current = 1;
  for (let index = 1; index < attempt; index++) {
    const next = prev + current;
    prev = current;
    current = next;
  }

  return Math.floor(Math.random() * current * delay);
};

interface ReanimateOpts {
  backoff?: Backoff
  delay?: number
}

/**
 * Reconnect the WebSocket with configurable exponential backoff, unless it was closed manually.
 * The calling function MUST use the return value, or this will not work.
 */
function reanimate(socket: WebSocket, opts: ReanimateOpts = {}): WebSocket {
  const { backoff = exponential, delay = 1000 } = opts;

  /** Whether the socket has been closed manually. */
  let closed = false;
  /** Number of attempts to reconnect. */
  let attempt = 0;

  const handleClose = () => {
    if (!closed && socket.readyState === WebSocket.CLOSED) {
      setTimeout(() => {
        socket.removeEventListener('close', handleClose);
        socket = new WebSocket(socket.url);
        socket.addEventListener('close', handleClose);
        reanimate(socket, opts);
      }, backoff(attempt, delay));
      attempt++;
    }
  };

  socket.addEventListener('close', handleClose);

  const close = socket.close.bind(socket);
  socket.close = function(...args) {
    closed = true;
    close(...args);
  };

  return socket;
}

export { exponential, fibonacci, reanimate, type Backoff };