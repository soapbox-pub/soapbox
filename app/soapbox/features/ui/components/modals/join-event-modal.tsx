import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinEvent } from 'soapbox/actions/events';
import { closeModal } from 'soapbox/actions/modals';
import { FormGroup, Modal, Textarea } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

const messages = defineMessages({
  hint: { id: 'join_event.hint', defaultMessage: 'You can tell the organizer why do you want to participate in this event:' },
  placeholder: { id: 'join_event.placeholder', defaultMessage: 'Message to organizer' },
  join: { id: 'join_event.join', defaultMessage: 'Request join' },
});

interface IAccountNoteModal {
  statusId: string
}

const AccountNoteModal: React.FC<IAccountNoteModal> = ({ statusId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [participationMessage, setParticipationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    dispatch(closeModal('JOIN_EVENT'));
  };

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setParticipationMessage(e.target.value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    dispatch(joinEvent(statusId, participationMessage)).then(() => {
      onClose();
    }).catch(() => {});
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Modal
      title={<FormattedMessage id='join_event.title' defaultMessage='Join event' />}
      onClose={onClose}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.join)}
      confirmationDisabled={isSubmitting}
    >
      <FormGroup labelText={intl.formatMessage(messages.hint)}>
        <Textarea
          placeholder={intl.formatMessage(messages.placeholder)}
          value={participationMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          autoFocus
        />
      </FormGroup>
    </Modal>
  );
};

export default AccountNoteModal;
