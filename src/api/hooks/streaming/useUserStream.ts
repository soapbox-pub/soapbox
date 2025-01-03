import { useStatContext } from 'soapbox/contexts/stat-context.tsx';
import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';

import { useTimelineStream } from './useTimelineStream.ts';

function useUserStream() {
  const { isLoggedIn } = useLoggedIn();
  const statContext = useStatContext();

  return useTimelineStream(
    'home',
    'user',
    null,
    { statContext, enabled: isLoggedIn },
  );
}

export { useUserStream };