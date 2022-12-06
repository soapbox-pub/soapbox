import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinEvent, leaveEvent } from 'soapbox/actions/events';
import { openModal } from 'soapbox/actions/modals';
import { Button } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import type { ButtonThemes } from 'soapbox/components/ui/button/useButtonStyles';
import type { Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
  leaveMessage: { id: 'confirmations.leave_event.message', defaultMessage: 'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?' },
});

interface IEventAction {
  status: StatusEntity
  theme?: ButtonThemes
}

const EventActionButton: React.FC<IEventAction> = ({ status, theme = 'secondary' }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const me = useAppSelector((state) => state.me);

  const event = status.event!;

  const handleJoin: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (event.join_mode === 'free') {
      dispatch(joinEvent(status.id));
    } else {
      dispatch(openModal('JOIN_EVENT', {
        statusId: status.id,
      }));
    }
  };

  const handleLeave: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (event.join_mode === 'restricted') {
      dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(messages.leaveMessage),
        confirm: intl.formatMessage(messages.leaveConfirm),
        onConfirm: () => dispatch(leaveEvent(status.id)),
      }));
    } else {
      dispatch(leaveEvent(status.id));
    }
  };

  const handleOpenUnauthorizedModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    dispatch(openModal('UNAUTHORIZED', {
      action: 'JOIN',
      ap_id: status.url,
    }));
  };

  let buttonLabel;
  let buttonIcon;
  let buttonDisabled = false;
  let buttonAction = handleLeave;

  switch (event.join_state) {
    case 'accept':
      buttonLabel = <FormattedMessage id='event.join_state.accept' defaultMessage='Going' />;
      buttonIcon = require('@tabler/icons/check.svg');
      break;
    case 'pending':
      buttonLabel = <FormattedMessage id='event.join_state.pending' defaultMessage='Pending' />;
      break;
    case 'reject':
      buttonLabel = <FormattedMessage id='event.join_state.rejected' defaultMessage='Going' />;
      buttonIcon = require('@tabler/icons/ban.svg');
      buttonDisabled = true;
      break;
    default:
      buttonLabel = <FormattedMessage id='event.join_state.empty' defaultMessage='Participate' />;
      buttonAction = me ? handleJoin : handleOpenUnauthorizedModal;
  }

  return (
    <Button
      size='sm'
      theme={theme}
      icon={buttonIcon}
      onClick={buttonAction}
      disabled={buttonDisabled}
    >
      {buttonLabel}
    </Button>
  );
};

export default EventActionButton;
