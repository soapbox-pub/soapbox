import { useTimelineStream } from './useTimelineStream';

interface UsePublicStreamOpts {
  onlyMedia?: boolean
}

function usePublicStream({ onlyMedia }: UsePublicStreamOpts = {}) {
  return useTimelineStream(
    `public${onlyMedia ? ':media' : ''}`,
    `public${onlyMedia ? ':media' : ''}`,
  );
}

export { usePublicStream };