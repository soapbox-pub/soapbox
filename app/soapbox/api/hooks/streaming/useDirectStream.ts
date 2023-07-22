import { useTimelineStream } from './useTimelineStream';

function useDirectStream() {
  return useTimelineStream('direct', 'direct');
}

export { useDirectStream };