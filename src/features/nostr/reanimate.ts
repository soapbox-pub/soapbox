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
  /** Function to compute the timeout between reconnections. */
  backoff?: Backoff
  /** Initial delay for reconnections. */
  delay?: number
}

/** Callback when the socket is reconnected. */
type Reanimator = (socket: WebSocket) => void;

/** Reconnect the WebSocket with configurable exponential backoff, unless it was closed manually. */
function reanimate(socket: WebSocket, onReanimate: Reanimator, opts: ReanimateOpts = {}): void {
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
        reanimate(socket, onReanimate, opts);
        onReanimate(socket);
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
}

export { exponential, fibonacci, reanimate, type Backoff };