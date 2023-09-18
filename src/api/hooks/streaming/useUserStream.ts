import { fetchAnnouncements } from 'soapbox/actions/announcements';
import { expandNotifications } from 'soapbox/actions/notifications';
import { expandHomeTimeline } from 'soapbox/actions/timelines';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useLoggedIn } from 'soapbox/hooks';

import { useTimelineStream } from './useTimelineStream';

import type { AppDispatch } from 'soapbox/store';

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
    dispatch(expandNotifications({}, () =>
      dispatch(fetchAnnouncements(done))))));
}

export { useUserStream };