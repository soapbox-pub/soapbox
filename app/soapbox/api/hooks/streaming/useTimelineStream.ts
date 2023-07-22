import { useEffect, useRef } from 'react';

import { connectTimelineStream } from 'soapbox/actions/streaming';
import { useAppDispatch, useAppSelector, useInstance } from 'soapbox/hooks';
import { getAccessToken } from 'soapbox/utils/auth';

function useTimelineStream(...args: Parameters<typeof connectTimelineStream>) {
  // TODO: get rid of streaming.ts and move the actual opts here.
  const [timelineId, path] = args;
  const { enabled = true } = args[4] ?? {};

  const dispatch = useAppDispatch();
  const instance = useInstance();
  const stream = useRef<(() => void) | null>(null);

  const accessToken = useAppSelector(getAccessToken);
  const streamingUrl = instance.urls.get('streaming_api');

  const connect = () => {
    if (enabled && streamingUrl && !stream.current) {
      stream.current = dispatch(connectTimelineStream(...args));
    }
  };

  const disconnect = () => {
    if (stream.current) {
      stream.current();
      stream.current = null;
    }
  };

  useEffect(() => {
    connect();
    return disconnect;
  }, [accessToken, streamingUrl, timelineId, path, enabled]);

  return {
    disconnect,
  };
}

export { useTimelineStream };