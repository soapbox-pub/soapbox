import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';

import { useTimelineStream } from './useTimelineStream.ts';

function useListStream(listId: string) {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    `list:${listId}`,
    `list&list=${listId}`,
    null,
    { enabled: isLoggedIn },
  );
}

export { useListStream };