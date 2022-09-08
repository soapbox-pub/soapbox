import React, { useEffect, useState } from 'react';

import { fetchStatus } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing_indicator';
import StatusMedia from 'soapbox/components/status-media';
import { Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useSettings } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';
import { defaultMediaVisibility } from 'soapbox/utils/status';

import type { Status as StatusEntity } from 'soapbox/types/entities';

const getStatus = makeGetStatus();

type RouteParams = { statusId: string };

interface IEventInformation {
  params: RouteParams,
}

const EventInformation: React.FC<IEventInformation> = ({ params }) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => getStatus(state, { id: params.statusId })) as StatusEntity;

  const settings = useSettings();
  const displayMedia = settings.get('displayMedia') as string;

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));

  useEffect(() => {
    dispatch(fetchStatus(params.statusId)).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });

    setShowMedia(defaultMediaVisibility(status, displayMedia));
  }, [params.statusId]);

  const handleToggleMediaVisibility = (): void => {
    setShowMedia(!showMedia);
  };

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) return null;

  return (
    <Stack className='mt-4 sm:p-2' space={2}>
      <Text
        className='break-words status__content'
        size='sm'
        dangerouslySetInnerHTML={{ __html: status.contentHtml }}
      />

      <StatusMedia
        status={status}
        excludeBanner
        showMedia={showMedia}
        onToggleVisibility={handleToggleMediaVisibility}
      />
    </Stack>
  );
};

export default EventInformation;
