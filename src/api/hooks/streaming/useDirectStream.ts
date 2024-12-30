import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';

import { useTimelineStream } from './useTimelineStream.ts';

function useDirectStream() {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    'direct',
    'direct',
    null,
    { enabled: isLoggedIn },
  );
}

export { useDirectStream };