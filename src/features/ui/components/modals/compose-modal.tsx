import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelReplyCompose, setGroupTimelineVisible, uploadCompose } from 'soapbox/actions/compose';
import { openModal, closeModal } from 'soapbox/actions/modals';
import { useGroup } from 'soapbox/api/hooks';
import { checkComposeContent } from 'soapbox/components/modal-root';
import { HStack, Modal, Text, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useCompose, useDraggedFiles } from 'soapbox/hooks';

import ComposeForm from '../../../compose/components/compose-form';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
});

interface IComposeModal {
  onClose: (type?: string) => void
  composeId?: string
}

const ComposeModal: React.FC<IComposeModal> = ({ onClose, composeId = 'compose-modal' }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement>(null);
  const compose = useCompose(composeId);

  const { id: statusId, privacy, in_reply_to: inReplyTo, quote, group_id: groupId } = compose!;

  const { isDragging, isDraggedOver } = useDraggedFiles(node, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const onClickClose = () => {
    if (checkComposeContent(compose)) {
      dispatch(openModal('CONFIRM', {
        icon: require('@tabler/icons/trash.svg'),
        heading: statusId
          ? <FormattedMessage id='confirmations.cancel_editing.heading' defaultMessage='Cancel post editing' />
          : <FormattedMessage id='confirmations.cancel.heading' defaultMessage='Discard post' />,
        message: statusId
          ? <FormattedMessage id='confirmations.cancel_editing.message' defaultMessage='Are you sure you want to cancel editing this post? All changes will be lost.' />
          : <FormattedMessage id='confirmations.cancel.message' defaultMessage='Are you sure you want to cancel creating this post?' />,
        confirm: intl.formatMessage(statusId ? messages.cancelEditing : messages.confirm),
        onConfirm: () => {
          dispatch(closeModal('COMPOSE'));
          dispatch(cancelReplyCompose());
        },
      }));
    } else {
      onClose('COMPOSE');
    }
  };

  const renderTitle = () => {
    if (statusId) {
      return <FormattedMessage id='navigation_bar.compose_edit' defaultMessage='Edit post' />;
    } else if (privacy === 'direct') {
      return <FormattedMessage id='navigation_bar.compose_direct' defaultMessage='Direct message' />;
    } else if (inReplyTo && groupId) {
      return <FormattedMessage id='navigation_bar.compose_group_reply' defaultMessage='Reply to group post' />;
    } else if (groupId) {
      return <FormattedMessage id='navigation_bar.compose_group' defaultMessage='Compose to group' />;
    } else if (inReplyTo) {
      return <FormattedMessage id='navigation_bar.compose_reply' defaultMessage='Reply to post' />;
    } else if (quote) {
      return <FormattedMessage id='navigation_bar.compose_quote' defaultMessage='Quote post' />;
    } else {
      return <FormattedMessage id='navigation_bar.compose' defaultMessage='Compose new post' />;
    }
  };

  return (
    <Modal
      ref={node}
      title={renderTitle()}
      onClose={onClickClose}
      className={clsx({
        'border-2 border-primary-600 border-dashed !z-[99]': isDragging,
        'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
      })}
    >
      <ComposeForm
        id={composeId}
        extra={<ComposeFormGroupToggle composeId={composeId} groupId={groupId} />}
      />
    </Modal>
  );
};

interface IComposeFormGroupToggle {
  composeId: string
  groupId: string | null
}

const ComposeFormGroupToggle: React.FC<IComposeFormGroupToggle> = ({ composeId, groupId }) => {
  const dispatch = useAppDispatch();
  const { group } = useGroup(groupId || '', false);

  const groupTimelineVisible = useAppSelector((state) => !!state.compose.get(composeId)?.group_timeline_visible);

  const handleToggleChange = () => {
    dispatch(setGroupTimelineVisible(composeId, !groupTimelineVisible));
  };

  const labelId = `group-timeline-visible+${composeId}`;

  if (!group) return null;
  if (group.locked) return null;

  return (
    <HStack alignItems='center' space={4}>
      <label className='ml-auto cursor-pointer' htmlFor={labelId}>
        <Text theme='muted'>
          <FormattedMessage id='compose_group.share_to_followers' defaultMessage='Share with my followers' />
        </Text>
      </label>
      <Toggle
        id={labelId}
        checked={groupTimelineVisible}
        onChange={handleToggleChange}
        size='sm'
      />
    </HStack>
  );
};

export default ComposeModal;
