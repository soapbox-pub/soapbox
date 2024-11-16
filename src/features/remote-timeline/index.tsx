import xIcon from '@tabler/icons/outline/x.svg';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { expandRemoteTimeline } from 'soapbox/actions/timelines.ts';
import { useRemoteStream } from 'soapbox/api/hooks/index.ts';
import IconButton from 'soapbox/components/icon-button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { useTheme } from 'soapbox/hooks/useTheme.ts';

import Timeline from '../ui/components/timeline.tsx';

import PinnedHostsPicker from './components/pinned-hosts-picker.tsx';

interface IRemoteTimeline {
  params?: {
    instance?: string;
  };
}

/** View statuses from a remote instance. */
const RemoteTimeline: React.FC<IRemoteTimeline> = ({ params }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const instance = params?.instance as string;
  const settings = useSettings();

  const timelineId = 'remote';
  const onlyMedia = settings.remote.other.onlyMedia;
  const next = useAppSelector(state => state.timelines.get('remote')?.next);

  const pinned = settings.remote_timeline.pinnedHosts.includes(instance);
  const isMobile = useIsMobile();

  const handleCloseClick: React.MouseEventHandler = () => {
    history.push('/timeline/fediverse');
  };

  const handleLoadMore = (maxId: string) => {
    dispatch(expandRemoteTimeline(instance, { url: next, maxId, onlyMedia }));
  };

  useRemoteStream({ instance, onlyMedia });

  useEffect(() => {
    dispatch(expandRemoteTimeline(instance, { onlyMedia, maxId: undefined }));
  }, [onlyMedia]);

  return (
    <Column label={instance} transparent={!isMobile}>
      {instance && <PinnedHostsPicker host={instance} />}

      {!pinned && (
        <HStack className='mb-4 px-2' space={2}>
          <IconButton iconClassName='h-5 w-5' src={xIcon} onClick={handleCloseClick} />
          <Text>
            <FormattedMessage
              id='remote_timeline.filter_message'
              defaultMessage='You are viewing the timeline of {instance}.'
              values={{ instance }}
            />
          </Text>
        </HStack>
      )}

      <Timeline
        className='black:p-4 black:sm:p-5'
        scrollKey={`${timelineId}_${instance}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}:${instance}`}
        onLoadMore={handleLoadMore}
        emptyMessage={
          <FormattedMessage
            id='empty_column.remote'
            defaultMessage='There is nothing here! Manually follow users from {instance} to fill it up.'
            values={{ instance }}
          />
        }
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export default RemoteTimeline;
