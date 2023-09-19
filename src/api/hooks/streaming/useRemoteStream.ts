import { useTimelineStream } from './useTimelineStream';

interface UseRemoteStreamOpts {
  instance: string
  onlyMedia?: boolean
}

function useRemoteStream({ instance, onlyMedia }: UseRemoteStreamOpts) {
  return useTimelineStream(
    `remote${onlyMedia ? ':media' : ''}:${instance}`,
    `public:remote${onlyMedia ? ':media' : ''}&instance=${instance}`,
  );
}

export { useRemoteStream };