import { useEffect, useRef } from 'react';

import { connectTimelineStream } from 'soapbox/actions/streaming.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { getAccessToken } from 'soapbox/utils/auth.ts';

function useTimelineStream(...args: Parameters<typeof connectTimelineStream>) {
  // TODO: get rid of streaming.ts and move the actual opts here.
  const [timelineId, path] = args;
  const { enabled = true } = args[3] ?? {};

  const dispatch = useAppDispatch();
  const { instance } = useInstance();
  const stream = useRef<(() => void) | null>(null);

  const accessToken = useAppSelector(getAccessToken);
  const streamingUrl = instance.configuration.urls.streaming;

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