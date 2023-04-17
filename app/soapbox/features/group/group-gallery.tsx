import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import LoadMore from 'soapbox/components/load-more';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Column, Spinner } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { useGroup, useGroupMedia } from 'soapbox/hooks/api';

import MediaItem from '../account-gallery/components/media-item';

import type { Attachment, Status } from 'soapbox/types/entities';

const GroupGallery = () => {
  const dispatch = useAppDispatch();

  const { groupId } = useParams<{ groupId: string }>();

  const { group, isLoading: groupIsLoading } = useGroup(groupId);

  const {
    entities: statuses,
    fetchNextPage,
    isLoading,
    hasNextPage,
  } = useGroupMedia(groupId);

  const attachments = statuses.reduce<Attachment[]>((result, status) => {
    result.push(...status.media_attachments.map((a) => a.set('status', status)));
    return result;
  }, []);

  const handleOpenMedia = (attachment: Attachment) => {
    if (attachment.type === 'video') {
      dispatch(openModal('VIDEO', { media: attachment, status: attachment.status, account: attachment.account }));
    } else {
      const media = (attachment.status as Status).media_attachments;
      const index = media.findIndex((x) => x.id === attachment.id);

      dispatch(openModal('MEDIA', { media, index, status: attachment.status }));
    }
  };

  if (isLoading || groupIsLoading) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!group) {
    return (
      <MissingIndicator />
    );
  }

  return (
    <Column label={group.display_name} transparent withHeader={false}>
      <div role='feed' className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {attachments.map((attachment) => (
          <MediaItem
            key={`${attachment.status.id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
          />
        ))}

        {(!isLoading && attachments.length === 0) && (
          <div className='empty-column-indicator'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}

        {(hasNextPage && !isLoading) && (
          <LoadMore className='my-auto' visible={!isLoading} onClick={fetchNextPage} />
        )}
      </div>

      {isLoading && (
        <div className='slist__append'>
          <Spinner />
        </div>
      )}
    </Column>
  );
};

export default GroupGallery;
