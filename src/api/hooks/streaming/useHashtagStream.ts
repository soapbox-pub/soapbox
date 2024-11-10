import { useTimelineStream } from './useTimelineStream.ts';

function useHashtagStream(tag: string) {
  return useTimelineStream(
    `hashtag:${tag}`,
    `hashtag&tag=${tag}`,
  );
}

export { useHashtagStream };