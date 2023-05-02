import React from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { useGroup, useGroupMedia } from 'soapbox/api/hooks';
import LoadMore from 'soapbox/components/load-more';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Column, Spinner } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import MediaItem from '../account-gallery/components/media-item';

import type { Attachment, Status } from 'soapbox/types/entities';

interface IGroupGallery {
  params: { groupId: string }
}

const GroupGallery: React.FC<IGroupGallery> = (props) => {
  const { groupId } = props.params;

  const dispatch = useAppDispatch();

  const { group, isLoading: groupIsLoading } = useGroup(groupId);

  const {
    entities: statuses,
    fetchNextPage,
    isLoading,
    isFetching,
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
      <Column transparent withHeader={false}>
        <div className='pt-6'>
          <Spinner />
        </div>
      </Column>
    );
  }

  if (!group) {
    return (
      <div className='pt-6'>
        <MissingIndicator nested />
      </div>
    );
  }

  return (
    <Column label={group.display_name} transparent withHeader={false}>
      <div role='feed' className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {attachments.map((attachment) => (
          <MediaItem
            key={`${attachment.status.id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
          />
        ))}

        {(!isLoading && attachments.length === 0) && (
          <div className='empty-column-indicator col-span-2 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {hasNextPage && (
        <LoadMore className='mt-4' disabled={isFetching} onClick={fetchNextPage} />
      )}
    </Column>
  );
};

export default GroupGallery;
