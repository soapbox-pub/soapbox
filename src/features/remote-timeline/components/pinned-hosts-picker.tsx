import Button from '@/components/ui/button.tsx';
import HStack from '@/components/ui/hstack.tsx';
import { useSettings } from '@/hooks/useSettings.ts';

interface IPinnedHostsPicker {
  /** The active host among pinned hosts. */
  host?: string;
}

const PinnedHostsPicker: React.FC<IPinnedHostsPicker> = ({ host: activeHost }) => {
  const settings = useSettings();
  const pinnedHosts = settings.remote_timeline.pinnedHosts;

  if (!pinnedHosts.length) return null;

  return (
    <HStack className='mb-4 flex-wrap items-start justify-evenly'>
      {pinnedHosts.map((host) => (
        <Button
          key={host}
          to={`/timeline/${host}`}
          size='sm'
          theme={host === activeHost ? 'accent' : 'secondary'}
          className='m-1 w-40 p-1'
        >
          {host}
        </Button>
      ))}
    </HStack>
  );
};

export default PinnedHostsPicker;
