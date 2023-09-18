import { useTimelineStream } from './useTimelineStream';

function useGroupStream(groupId: string) {
  return useTimelineStream(
    `group:${groupId}`,
    `group&group=${groupId}`,
  );
}

export { useGroupStream };