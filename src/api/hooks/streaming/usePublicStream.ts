import { useTimelineStream } from './useTimelineStream';

interface UsePublicStreamOpts {
  onlyMedia?: boolean;
  language?: string;
}

function usePublicStream({ onlyMedia, language }: UsePublicStreamOpts = {}) {
  return useTimelineStream(
    `public${onlyMedia ? ':media' : ''}`,
    `public${onlyMedia ? ':media' : ''}`,
    null,
    null,
    { enabled: !language },
  );
}

export { usePublicStream };