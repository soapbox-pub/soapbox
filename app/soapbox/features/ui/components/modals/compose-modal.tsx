import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelReplyCompose } from 'soapbox/actions/compose';
import { openModal, closeModal } from 'soapbox/actions/modals';
import { checkComposeContent } from 'soapbox/components/modal-root';
import { Modal } from 'soapbox/components/ui';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

import ComposeForm from '../../../compose/components/compose-form';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
});

interface IComposeModal {
  onClose: (type?: string) => void
}

const ComposeModal: React.FC<IComposeModal> = ({ onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose('compose-modal');

  const { id: statusId, privacy, in_reply_to: inReplyTo, quote } = compose!;

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
      title={renderTitle()}
      onClose={onClickClose}
    >
      <ComposeForm id='compose-modal' />
    </Modal>
  );
};

export default ComposeModal;
