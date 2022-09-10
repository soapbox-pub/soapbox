import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addPoll, removePoll } from 'soapbox/actions/compose';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import ComposeFormButton from './compose_form_button';

const messages = defineMessages({
  add_poll: { id: 'poll_button.add_poll', defaultMessage: 'Add a poll' },
  remove_poll: { id: 'poll_button.remove_poll', defaultMessage: 'Remove poll' },
});

interface IPollButton {
  composeId: string
  disabled?: boolean,
}

const PollButton: React.FC<IPollButton> = ({ composeId, disabled }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const unavailable = useAppSelector((state) => state.compose.get(composeId)!.is_uploading);
  const active = useAppSelector((state) => state.compose.get(composeId)!.poll !== null);

  const onClick = () => {
    if (active) {
      dispatch(removePoll(composeId));
    } else {
      dispatch(addPoll(composeId));
    }
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@tabler/icons/chart-bar.svg')}
      title={intl.formatMessage(active ? messages.remove_poll : messages.add_poll)}
      active={active}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export default PollButton;
