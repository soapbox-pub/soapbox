import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { deleteGroup, editGroup, fetchGroup } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import List, { ListItem } from 'soapbox/components/list';
import { CardBody, Column, Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetGroup } from 'soapbox/selectors';

import ColumnForbidden from '../ui/components/column-forbidden';

type RouteParams = { id: string };

const messages = defineMessages({
  heading: { id: 'column.manage_group', defaultMessage: 'Manage group' },
  editGroup: { id: 'manage_group.edit_group', defaultMessage: 'Edit group' },
  pendingRequests: { id: 'manage_group.pending_requests', defaultMessage: 'Pending requests' },
  blockedMembers: { id: 'manage_group.blocked_members', defaultMessage: 'Blocked members' },
  deleteGroup: { id: 'manage_group.delete_group', defaultMessage: 'Delete group' },
  deleteConfirm: { id: 'confirmations.delete_group.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete_group.heading', defaultMessage: 'Delete group' },
  deleteMessage: { id: 'confirmations.delete_group.message', defaultMessage: 'Are you sure you want to delete this group? This is a permanent action that cannot be undone.' },
});

interface IManageGroup {
  params: RouteParams
}

const ManageGroup: React.FC<IManageGroup> = ({ params }) => {
  const history = useHistory();
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const id = params?.id || '';

  const getGroup = useCallback(makeGetGroup(), []);
  const group = useAppSelector(state => getGroup(state, id));

  useEffect(() => {
    if (!group) dispatch(fetchGroup(id));
  }, [id]);

  if (!group || !group.relationship) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const onEditGroup = () =>
    dispatch(editGroup(group));

  const onDeleteGroup = () =>
    dispatch(openModal('CONFIRM', {
      icon: require('@tabler/icons/trash.svg'),
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => dispatch(deleteGroup(id)),
    }));

  const navigateToPending = () => history.push(`/groups/${id}/manage/requests`);
  const navigateToBlocks = () => history.push(`/groups/${id}/manage/blocks`);

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/groups/${id}`}>
      <CardBody className='space-y-4'>
        {group.relationship.role === 'admin' && (
          <List>
            <ListItem label={intl.formatMessage(messages.editGroup)} onClick={onEditGroup}>
              <span dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
            </ListItem>
          </List>
        )}
        <List>
          <ListItem label={intl.formatMessage(messages.pendingRequests)} onClick={navigateToPending} />
          <ListItem label={intl.formatMessage(messages.blockedMembers)} onClick={navigateToBlocks} />
        </List>
        {group.relationship.role === 'admin' && (
          <List>
            <ListItem label={intl.formatMessage(messages.deleteGroup)} onClick={onDeleteGroup} />
          </List>
        )}
      </CardBody>
    </Column>
  );
};

export default ManageGroup;
