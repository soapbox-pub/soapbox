import { useFeatures } from 'soapbox/hooks';

import { useTimelineStream } from './useTimelineStream';

function useNostrStream() {
  const features = useFeatures();
  const enabled = features.nostrSign && Boolean(window.nostr);
  return useTimelineStream('nostr', 'nostr', null, null, { enabled });
}

export { useNostrStream };