import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchEventParticipations } from 'soapbox/actions/events';
import { Modal, Spinner, Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account_container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

interface IEventParticipantsModal {
  onClose: (type: string) => void,
  statusId: string,
}

const EventParticipantsModal: React.FC<IEventParticipantsModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.event_participations.get(statusId)?.items);

  const fetchData = () => {
    dispatch(fetchEventParticipations(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('EVENT_PARTICIPANTS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    body = (
      <Stack space={3}>
        {accountIds.size > 0 ? (
          accountIds.map((id) =>
            <AccountContainer key={id} id={id} />,
          )
        ) : (
          <FormattedMessage id='empty_column.event_participants' defaultMessage='No one joined this event yet. When someone does, they will show up here.' />
        )}
      </Stack>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.event_participants' defaultMessage='Event participants' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default EventParticipantsModal;
