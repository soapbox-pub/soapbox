import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { Button } from 'soapbox/components/ui';
import { deleteEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useAppDispatch } from 'soapbox/hooks';
import { useCancelMembershipRequest, useJoinGroup, useLeaveGroup } from 'soapbox/hooks/api';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';

import type { Group } from 'soapbox/types/entities';

interface IGroupActionButton {
  group: Group
}

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  joinRequestSuccess: { id: 'group.join.request_success', defaultMessage: 'Requested to join the group' },
  joinSuccess: { id: 'group.join.success', defaultMessage: 'Group joined successfully!' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
});

const GroupActionButton = ({ group }: IGroupActionButton) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const joinGroup = useJoinGroup(group);
  const leaveGroup = useLeaveGroup(group);
  const cancelRequest = useCancelMembershipRequest(group);

  const isRequested = group.relationship?.requested;
  const isNonMember = !group.relationship?.member && !isRequested;
  const isOwner = group.relationship?.role === GroupRoles.OWNER;
  const isBlocked = group.relationship?.blocked_by;

  const onJoinGroup = () => joinGroup.mutate({}, {
    onSuccess() {
      joinGroup.invalidate();

      toast.success(
        group.locked
          ? intl.formatMessage(messages.joinRequestSuccess)
          : intl.formatMessage(messages.joinSuccess),
      );
    },
  });

  const onLeaveGroup = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => leaveGroup.mutate(group.relationship?.id as string, {
        onSuccess() {
          leaveGroup.invalidate();
          toast.success(intl.formatMessage(messages.leaveSuccess));
        },
      }),
    }));

  const onCancelRequest = () => cancelRequest.mutate({}, {
    onSuccess() {
      dispatch(deleteEntities([group.id], Entities.GROUP_RELATIONSHIPS));
    },
  });

  if (isBlocked) {
    return null;
  }

  if (isOwner) {
    return (
      <Button
        theme='secondary'
        to={`/groups/${group.id}/manage`}
      >
        <FormattedMessage id='group.manage' defaultMessage='Manage Group' />
      </Button>
    );
  }

  if (isNonMember) {
    return (
      <Button
        theme='primary'
        onClick={onJoinGroup}
        disabled={joinGroup.isLoading}
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
        onClick={onCancelRequest}
        disabled={cancelRequest.isLoading}
      >
        <FormattedMessage id='group.cancel_request' defaultMessage='Cancel Request' />
      </Button>
    );
  }

  return (
    <Button
      theme='secondary'
      onClick={onLeaveGroup}
      disabled={leaveGroup.isLoading}
    >
      <FormattedMessage id='group.leave' defaultMessage='Leave Group' />
    </Button>
  );
};

export default GroupActionButton;