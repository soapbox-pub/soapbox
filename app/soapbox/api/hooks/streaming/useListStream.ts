import { useTimelineStream } from './useTimelineStream';

function useListStream(listId: string) {
  return useTimelineStream(
    `list:${listId}`,
    `list&list=${listId}`,
  );
}

export { useListStream };