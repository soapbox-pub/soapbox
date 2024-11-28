import { ExponentialBackoff, Websocket, WebsocketBuilder } from 'websocket-ts';

import { getAccessToken } from 'soapbox/utils/auth.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

const randomIntUpTo = (max: number) => Math.floor(Math.random() * Math.floor(max));

interface ConnectStreamCallbacks {
  onConnect(): void;
  onDisconnect(): void;
  onReceive(websocket: Websocket, data: unknown): void;
}

type PollingRefreshFn = (dispatch: AppDispatch, done?: () => void) => void

export function connectStream(
  path: string,
  pollingRefresh: PollingRefreshFn | null = null,
  callbacks: (dispatch: AppDispatch, getState: () => RootState) => ConnectStreamCallbacks,
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const streamingAPIBaseURL = getState().instance.configuration.urls.streaming;
    const accessToken = getAccessToken(getState());
    const { onConnect, onDisconnect, onReceive } = callbacks(dispatch, getState);

    let polling: NodeJS.Timeout | null = null;

    const setupPolling = () => {
      if (pollingRefresh) {
        pollingRefresh(dispatch, () => {
          polling = setTimeout(() => setupPolling(), 20000 + randomIntUpTo(20000));
        });
      }
    };

    const clearPolling = () => {
      if (polling) {
        clearTimeout(polling);
        polling = null;
      }
    };

    let subscription: Websocket;

    // If the WebSocket fails to be created, don't crash the whole page,
    // just proceed without a subscription.
    try {
      subscription = getStream(streamingAPIBaseURL!, accessToken!, path, {
        connected() {
          if (pollingRefresh) {
            clearPolling();
          }

          onConnect();
        },

        disconnected() {
          if (pollingRefresh) {
            polling = setTimeout(() => setupPolling(), randomIntUpTo(40000));
          }

          onDisconnect();
        },

        received(data) {
          onReceive(subscription, data);
        },

        reconnected() {
          if (pollingRefresh) {
            clearPolling();
            pollingRefresh(dispatch);
          }

          onConnect();
        },

      });
    } catch (e) {
      console.error(e);
    }

    const disconnect = () => {
      if (subscription) {
        subscription.close();
      }

      clearPolling();
    };

    return disconnect;
  };
}

export default function getStream(
  streamingAPIBaseURL: string,
  accessToken: string,
  stream: string,
  { connected, received, disconnected, reconnected }: {
    connected: ((ev: Event) => any) | null;
    received: (data: any) => void;
    disconnected: ((ev: Event) => any) | null;
    reconnected: ((ev: Event) => any);
  },
) {
  const params = [ `stream=${stream}` ];

  const ws = new WebsocketBuilder(`${streamingAPIBaseURL}/api/v1/streaming/?${params.join('&')}`)
    .withProtocols(accessToken)
    .withBackoff(new ExponentialBackoff(1000, 6))
    .onOpen((_ws, ev) => {
      connected?.(ev);
    })
    .onClose((_ws, ev) => {
      disconnected?.(ev);
    })
    .onReconnect((_ws, ev) => {
      reconnected(ev);
    })
    .onMessage((_ws, e) => {
      if (!e.data) return;
      try {
        received(JSON.parse(e.data));
      } catch (error) {
        console.error(e);
        console.error(`Could not parse the above streaming event.\n${error}`);
      }
    })
    .build();

  return ws;
}
