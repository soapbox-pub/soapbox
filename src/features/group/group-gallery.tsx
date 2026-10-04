import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from '@/actions/modals.ts';
import { expandGroupMediaTimeline } from '@/actions/timelines.ts';
import { useGroup } from '@/api/hooks/index.ts';
import LoadMore from '@/components/load-more.tsx';
import MissingIndicator from '@/components/missing-indicator.tsx';
import { Column } from '@/components/ui/column.tsx';
import Spinner from '@/components/ui/spinner.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { getGroupGallery } from '@/selectors/index.ts';

import MediaItem from '../account-gallery/components/media-item.tsx';

import type { Attachment, Status } from '@/types/entities.ts';

interface IGroupGallery {
  params: { groupId: string };
}

const GroupGallery: React.FC<IGroupGallery> = (props) => {
  const { groupId } = props.params;

  const dispatch = useAppDispatch();

  const { group, isLoading: groupIsLoading } = useGroup(groupId);

  const attachments = useAppSelector((state) => getGroupGallery(state, groupId));
  const isLoading = useAppSelector((state) => state.timelines[`group:${groupId}:media`]?.isLoading ?? true);
  const hasNextPage = useAppSelector((state) => !!state.timelines[`group:${groupId}:media`]?.hasMore);

  useEffect(() => {
    dispatch(expandGroupMediaTimeline(groupId));
  }, [groupId]);

  const fetchNextPage = () => {
    const lastStatusId = attachments[attachments.length - 1]?.status.id;
    dispatch(expandGroupMediaTimeline(groupId, { maxId: lastStatusId }));
  };

  const handleOpenMedia = (attachment: Attachment) => {
    if (attachment.type === 'video') {
      dispatch(openModal('VIDEO', { media: attachment, status: attachment.status, account: attachment.account }));
    } else {
      const media = (attachment.status as Status).media_attachments;
      const index = media.findIndex((x) => x.id === attachment.id);

      dispatch(openModal('MEDIA', { media: media, index, status: attachment.status }));
    }
  };

  if ((isLoading && attachments.length === 0) || groupIsLoading) {
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
          <div className='col-span-2 flex min-h-[160px] flex-1 items-center justify-center rounded-lg bg-primary-50 p-10 text-center text-gray-900 dark:bg-gray-700 dark:text-gray-300 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {hasNextPage && (
        <LoadMore className='mt-4' disabled={isLoading} onClick={fetchNextPage} />
      )}
    </Column>
  );
};

export default GroupGallery;
