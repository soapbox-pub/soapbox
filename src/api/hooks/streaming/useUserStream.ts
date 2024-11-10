import { expandNotifications } from 'soapbox/actions/notifications.ts';
import { expandHomeTimeline } from 'soapbox/actions/timelines.ts';
import { useStatContext } from 'soapbox/contexts/stat-context.tsx';
import { useLoggedIn } from 'soapbox/hooks/index.ts';

import { useTimelineStream } from './useTimelineStream.ts';

import type { AppDispatch } from 'soapbox/store.ts';

function useUserStream() {
  const { isLoggedIn } = useLoggedIn();
  const statContext = useStatContext();

  return useTimelineStream(
    'home',
    'user',
    refresh,
    null,
    { statContext, enabled: isLoggedIn },
  );
}

/** Refresh home timeline and notifications. */
function refresh(dispatch: AppDispatch, done?: () => void) {
  return dispatch(expandHomeTimeline({}, () =>
    dispatch(expandNotifications({}, done))));
}

export { useUserStream };