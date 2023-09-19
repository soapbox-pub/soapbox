import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { expandRemoteTimeline } from 'soapbox/actions/timelines';
import { useRemoteStream } from 'soapbox/api/hooks';
import IconButton from 'soapbox/components/icon-button';
import { Column, HStack, Text } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch, useSettings } from 'soapbox/hooks';

import Timeline from '../ui/components/timeline';

import PinnedHostsPicker from './components/pinned-hosts-picker';

interface IRemoteTimeline {
  params?: {
    instance?: string
  }
}

/** View statuses from a remote instance. */
const RemoteTimeline: React.FC<IRemoteTimeline> = ({ params }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const instance = params?.instance as string;
  const settings = useSettings();

  const timelineId = 'remote';
  const onlyMedia = !!settings.getIn(['remote', 'other', 'onlyMedia']);
  const next = useAppSelector(state => state.timelines.get('remote')?.next);

  const pinned: boolean = (settings.getIn(['remote_timeline', 'pinnedHosts']) as any).includes(instance);

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
    <Column label={instance} transparent>
      {instance && <PinnedHostsPicker host={instance} />}

      {!pinned && (
        <HStack className='mb-4 px-2' space={2}>
          <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/x.svg')} onClick={handleCloseClick} />
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
        divideType='space'
      />
    </Column>
  );
};

export default RemoteTimeline;
