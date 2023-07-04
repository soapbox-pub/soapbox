import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchGroupRelationshipsSuccess } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import { useCancelMembershipRequest, useJoinGroup, useLeaveGroup, usePendingGroups } from 'soapbox/api/hooks';
import { Button } from 'soapbox/components/ui';
import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useAppDispatch } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';

import type { Group, GroupRelationship } from 'soapbox/types/entities';

interface IGroupActionButton {
  group: Group
}

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  joinRequestSuccess: { id: 'group.join.request_success', defaultMessage: 'Request sent to group owner' },
  joinSuccess: { id: 'group.join.success', defaultMessage: 'Group joined successfully!' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
});

const GroupActionButton = ({ group }: IGroupActionButton) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const joinGroup = useJoinGroup(group);
  const leaveGroup = useLeaveGroup(group);
  const cancelRequest = useCancelMembershipRequest(group);
  const { invalidate: invalidatePendingGroups } = usePendingGroups();

  const isRequested = group.relationship?.requested;
  const isNonMember = !group.relationship?.member && !isRequested;
  const isOwner = group.relationship?.role === GroupRoles.OWNER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;
  const isBlocked = group.relationship?.blocked_by;

  const onJoinGroup = () => joinGroup.mutate({}, {
    onSuccess(entity) {
      joinGroup.invalidate();
      invalidatePendingGroups();
      dispatch(fetchGroupRelationshipsSuccess([entity]));

      toast.success(
        group.locked
          ? intl.formatMessage(messages.joinRequestSuccess)
          : intl.formatMessage(messages.joinSuccess),
      );
    },
    onError(error) {
      const message = (error.response?.data as any).error;
      if (message) {
        toast.error(message);
      }
    },
  });

  const onLeaveGroup = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => leaveGroup.mutate(group.relationship?.id as string, {
        onSuccess(entity) {
          leaveGroup.invalidate();
          dispatch(fetchGroupRelationshipsSuccess([entity]));
          toast.success(intl.formatMessage(messages.leaveSuccess));
        },
      }),
    }));

  const onCancelRequest = () => cancelRequest.mutate({}, {
    onSuccess() {
      const entity = {
        ...group.relationship as GroupRelationship,
        requested: false,
      };
      dispatch(importEntities([entity], Entities.GROUP_RELATIONSHIPS));
      invalidatePendingGroups();
    },
  });

  if (isBlocked) {
    return null;
  }

  if (isOwner || isAdmin) {
    return (
      <Button
        theme='secondary'
        to={`/group/${group.slug}/manage`}
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
        disabled={joinGroup.isSubmitting}
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
        disabled={cancelRequest.isSubmitting}
      >
        <FormattedMessage id='group.cancel_request' defaultMessage='Cancel Request' />
      </Button>
    );
  }

  return (
    <Button
      theme='secondary'
      onClick={onLeaveGroup}
      disabled={leaveGroup.isSubmitting}
    >
      <FormattedMessage id='group.leave' defaultMessage='Leave Group' />
    </Button>
  );
};

export default GroupActionButton;