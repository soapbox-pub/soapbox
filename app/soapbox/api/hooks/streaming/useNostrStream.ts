import { useFeatures, useLoggedIn } from 'soapbox/hooks';

import { useTimelineStream } from './useTimelineStream';

function useNostrStream() {
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    'nostr',
    'nostr',
    null,
    null,
    {
      enabled: isLoggedIn && features.nostrSign && Boolean(window.nostr),
    },
  );
}

export { useNostrStream };