import { useTimelineStream } from './useTimelineStream.ts';

function useGroupStream(groupId: string) {
  return useTimelineStream(
    `group:${groupId}`,
    `group&group=${groupId}`,
  );
}

export { useGroupStream };