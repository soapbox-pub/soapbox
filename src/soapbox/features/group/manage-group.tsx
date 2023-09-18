import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import { useDeleteGroup, useGroup } from 'soapbox/api/hooks';
import List, { ListItem } from 'soapbox/components/list';
import { CardBody, CardHeader, CardTitle, Column, Spinner, Text } from 'soapbox/components/ui';
import { useAppDispatch, useBackend, useGroupsPath } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';
import { TRUTHSOCIAL } from 'soapbox/utils/features';

import ColumnForbidden from '../ui/components/column-forbidden';

type RouteParams = { groupId: string };

const messages = defineMessages({
  heading: { id: 'column.manage_group', defaultMessage: 'Manage Group' },
  editGroup: { id: 'manage_group.edit_group', defaultMessage: 'Edit Group' },
  pendingRequests: { id: 'manage_group.pending_requests', defaultMessage: 'Pending Requests' },
  blockedMembers: { id: 'manage_group.blocked_members', defaultMessage: 'Banned Members' },
  deleteGroup: { id: 'manage_group.delete_group', defaultMessage: 'Delete Group' },
  deleteConfirm: { id: 'confirmations.delete_group.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete_group.heading', defaultMessage: 'Delete Group' },
  deleteMessage: { id: 'confirmations.delete_group.message', defaultMessage: 'Are you sure you want to delete this group? This is a permanent action that cannot be undone.' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  other: { id: 'settings.other', defaultMessage: 'Other Options' },
  deleteSuccess: { id: 'group.delete.success', defaultMessage: 'Group successfully deleted' },
});

interface IManageGroup {
  params: RouteParams
}

const ManageGroup: React.FC<IManageGroup> = ({ params }) => {
  const { groupId: id } = params;

  const backend = useBackend();
  const dispatch = useAppDispatch();
  const groupsPath = useGroupsPath();
  const history = useHistory();
  const intl = useIntl();

  const { group } = useGroup(id);

  const deleteGroup = useDeleteGroup();

  const isOwner = group?.relationship?.role === GroupRoles.OWNER;

  if (!group || !group.relationship) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const onDeleteGroup = () =>
    dispatch(openModal('CONFIRM', {
      icon: require('@tabler/icons/trash.svg'),
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteGroup.mutate(group.id, {
          onSuccess() {
            toast.success(intl.formatMessage(messages.deleteSuccess));
            history.push(groupsPath);
          },
        });
      },
    }));

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/group/${group.slug}`}>
      <CardBody className='space-y-4'>
        {isOwner && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.editGroup)} />
            </CardHeader>

            <List>
              <ListItem label={intl.formatMessage(messages.editGroup)} to={`/group/${group.slug}/manage/edit`}>
                <span dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
              </ListItem>
            </List>
          </>
        )}

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.members)} />
        </CardHeader>

        <List>
          {backend.software !== TRUTHSOCIAL && (
            <ListItem label={intl.formatMessage(messages.pendingRequests)} to={`/group/${group.slug}/manage/requests`} />
          )}

          <ListItem label={intl.formatMessage(messages.blockedMembers)} to={`/group/${group.slug}/manage/blocks`} />
        </List>

        {isOwner && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.other)} />
            </CardHeader>

            <List>
              <ListItem label={<Text theme='danger'>{intl.formatMessage(messages.deleteGroup)}</Text>} onClick={onDeleteGroup} />
            </List>
          </>
        )}
      </CardBody>
    </Column>
  );
};

export default ManageGroup;
