import { useTimelineStream } from './useTimelineStream';

interface UseCommunityStreamOpts {
  onlyMedia?: boolean
}

function useCommunityStream({ onlyMedia }: UseCommunityStreamOpts = {}) {
  return useTimelineStream(
    `community${onlyMedia ? ':media' : ''}`,
    `public:local${onlyMedia ? ':media' : ''}`,
  );
}

export { useCommunityStream };