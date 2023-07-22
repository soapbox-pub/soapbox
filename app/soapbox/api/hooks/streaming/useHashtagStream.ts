import { useTimelineStream } from './useTimelineStream';

function useHashtagStream(tag: string) {
  return useTimelineStream(
    `hashtag:${tag}`,
    `hashtag&tag=${tag}`,
  );
}

export { useHashtagStream };