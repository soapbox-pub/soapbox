import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinGroup, leaveGroup } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import { Button } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { Group } from 'soapbox/types/entities';

interface IGroupActionButton {
  group: Group
}

const messages = defineMessages({
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
});

const GroupActionButton = ({ group }: IGroupActionButton) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const isNonMember = !group.relationship || !group.relationship.member;
  const isRequested = group.relationship?.requested;
  const isAdmin = group.relationship?.role === 'admin';

  const onJoinGroup = () => dispatch(joinGroup(group.id));

  const onLeaveGroup = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => dispatch(leaveGroup(group.id)),
    }));

  if (isNonMember) {
    return (
      <Button
        theme='primary'
        onClick={onJoinGroup}
      >
        {group.locked
          ? <FormattedMessage id='group.join.private' defaultMessage='Request Access' />
          : <FormattedMessage id='group.join.public' defaultMessage='Join Group' />}
      </Button>
    );
  }

  if (isRequested) {
    return (
      <Button
        theme='secondary'
        onClick={onLeaveGroup}
      >
        <FormattedMessage id='group.cancel_request' defaultMessage='Cancel Request' />
      </Button>
    );
  }

  if (isAdmin) {
    return (
      <Button
        theme='secondary'
        to={`/groups/${group.id}/manage`}
      >
        <FormattedMessage id='group.manage' defaultMessage='Manage Group' />
      </Button>
    );
  }

  return (
    <Button
      theme='secondary'
      onClick={onLeaveGroup}
    >
      <FormattedMessage id='group.leave' defaultMessage='Leave Group' />
    </Button>
  );
};

export default GroupActionButton;