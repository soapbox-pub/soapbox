import { useTimelineStream } from './useTimelineStream.ts';

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
    { enabled: !language }, // TODO: support language streaming
  );
}

export { usePublicStream };