import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinEvent, leaveEvent } from 'soapbox/actions/events';
import { openModal } from 'soapbox/actions/modals';
import { Button } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
  leaveMessage: { id: 'confirmations.leave_event.message', defaultMessage: 'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?' },
});

interface IEventAction {
  status: StatusEntity,
}

const EventActionButton: React.FC<IEventAction> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

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
      buttonAction = handleJoin;
  }

  return (
    <Button
      size='sm'
      theme='secondary'
      icon={buttonIcon}
      onClick={buttonAction}
      disabled={buttonDisabled}
    >
      {buttonLabel}
    </Button>
  );
};

export default EventActionButton;
