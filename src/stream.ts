import { ExponentialBackoff, Websocket, WebsocketBuilder } from 'websocket-ts';

import { getAccessToken } from 'soapbox/utils/auth.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

interface ConnectStreamCallbacks {
  onConnect(): void;
  onDisconnect(): void;
  onReceive(websocket: Websocket, data: unknown): void;
}

export function connectStream(
  path: string,
  callbacks: (dispatch: AppDispatch, getState: () => RootState) => ConnectStreamCallbacks,
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const streamingAPIBaseURL = getState().instance.configuration.urls.streaming;
    const accessToken = getAccessToken(getState());
    const { onConnect, onDisconnect, onReceive } = callbacks(dispatch, getState);

    let subscription: Websocket;

    // If the WebSocket fails to be created, don't crash the whole page,
    // just proceed without a subscription.
    try {
      subscription = getStream(streamingAPIBaseURL!, accessToken!, path, {
        connected() {
          onConnect();
        },

        disconnected() {
          onDisconnect();
        },

        received(data) {
          onReceive(subscription, data);
        },

        reconnected() {
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
