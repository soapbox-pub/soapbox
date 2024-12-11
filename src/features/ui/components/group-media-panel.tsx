import { List as ImmutableList } from 'immutable';
import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals.ts';
import { expandGroupMediaTimeline } from 'soapbox/actions/timelines.ts';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Widget from 'soapbox/components/ui/widget.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { getGroupGallery } from 'soapbox/selectors/index.ts';

import MediaItem from '../../account-gallery/components/media-item.tsx';

import type { Attachment, Group } from 'soapbox/types/entities.ts';

interface IGroupMediaPanel {
  group?: Group;
}

const GroupMediaPanel: React.FC<IGroupMediaPanel> = ({ group }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  const isMember = !!group?.relationship?.member;
  const isPrivate = group?.locked;

  const attachments: ImmutableList<Attachment> = useAppSelector((state) => group ? getGroupGallery(state, group?.id) : ImmutableList());

  const handleOpenMedia = (attachment: Attachment): void => {
    if (attachment.type === 'video') {
      dispatch(openModal('VIDEO', { media: attachment, status: attachment.status }));
    } else {
      const media = attachment.getIn(['status', 'media_attachments']) as ImmutableList<Attachment>;
      const index = media.findIndex(x => x.id === attachment.id);

      dispatch(openModal('MEDIA', { media: media.toJS(), index, status: attachment?.status?.toJS() ?? attachment.status, account: attachment.account })); // NOTE: why 'account' field is here? it doesn't exist in MediaModal component
    }
  };

  useEffect(() => {
    setLoading(true);

    if (group && !group.deleted_at && (isMember || !isPrivate)) {
      dispatch(expandGroupMediaTimeline(group.id))
      // @ts-ignore
        .then(() => setLoading(false))
        .catch(() => {});
    }
  }, [group?.id, isMember, isPrivate]);

  const renderAttachments = () => {
    const nineAttachments = attachments.slice(0, 9);

    if (!nineAttachments.isEmpty()) {
      return (
        <div className='grid grid-cols-3 gap-1'>
          {nineAttachments.map((attachment, _index) => (
            <MediaItem
              key={`${attachment.getIn(['status', 'id'])}+${attachment.id}`}
              attachment={attachment}
              onOpenMedia={handleOpenMedia}
            />
          ))}
        </div>
      );
    } else {
      return (
        <Text size='sm' theme='muted'>
          <FormattedMessage id='media_panel.empty_message' defaultMessage='No media found.' />
        </Text>
      );
    }
  };

  if ((isPrivate && !isMember) || group?.deleted_at) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      {group && (
        <div className='w-full'>
          {loading ? (
            <Spinner />
          ) : (
            renderAttachments()
          )}
        </div>
      )}
    </Widget>
  );
};

export default GroupMediaPanel;
