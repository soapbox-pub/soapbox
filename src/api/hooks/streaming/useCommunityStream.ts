import { useTimelineStream } from './useTimelineStream';

interface UseCommunityStreamOpts {
  onlyMedia?: boolean
  enabled?: boolean
}

function useCommunityStream({ onlyMedia, enabled }: UseCommunityStreamOpts = {}) {
  return useTimelineStream(
    `community${onlyMedia ? ':media' : ''}`,
    `public:local${onlyMedia ? ':media' : ''}`,
    undefined,
    undefined,
    { enabled },
  );
}

export { useCommunityStream };