import React, { useMemo } from 'react';
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl';

import { setRole } from 'soapbox/actions/admin';
import { SelectDropdown } from 'soapbox/features/forms';
import { useAppDispatch } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import type { Account as AccountEntity } from 'soapbox/schemas';

/** Staff role. */
type AccountRole = 'user' | 'moderator' | 'admin';

/** Get the highest staff role associated with the account. */
const getRole = (account: Pick<AccountEntity, 'admin' | 'moderator'>): AccountRole => {
  if (account.admin) {
    return 'admin';
  } else if (account.moderator) {
    return 'moderator';
  } else {
    return 'user';
  }
};

const messages = defineMessages({
  roleUser: { id: 'account_moderation_modal.roles.user', defaultMessage: 'User' },
  roleModerator: { id: 'account_moderation_modal.roles.moderator', defaultMessage: 'Moderator' },
  roleAdmin: { id: 'account_moderation_modal.roles.admin', defaultMessage: 'Admin' },
  promotedToAdmin: { id: 'admin.users.actions.promote_to_admin_message', defaultMessage: '@{acct} was promoted to an admin' },
  promotedToModerator: { id: 'admin.users.actions.promote_to_moderator_message', defaultMessage: '@{acct} was promoted to a moderator' },
  demotedToModerator: { id: 'admin.users.actions.demote_to_moderator_message', defaultMessage: '@{acct} was demoted to a moderator' },
  demotedToUser: { id: 'admin.users.actions.demote_to_user_message', defaultMessage: '@{acct} was demoted to a regular user' },
});

interface IStaffRolePicker {
  /** Account whose role to change. */
  account: Pick<AccountEntity, 'id' | 'acct' | 'admin' | 'moderator'>
}

/** Picker for setting the staff role of an account. */
const StaffRolePicker: React.FC<IStaffRolePicker> = ({ account }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const roles: Record<AccountRole, string> = useMemo(() => ({
    user: intl.formatMessage(messages.roleUser),
    moderator: intl.formatMessage(messages.roleModerator),
    admin: intl.formatMessage(messages.roleAdmin),
  }), []);

  const handleRoleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const role = e.target.value as AccountRole;

    dispatch(setRole(account.id, role))
      .then(() => {
        let message: MessageDescriptor | undefined;

        if (role === 'admin') {
          message = messages.promotedToAdmin;
        } else if (role === 'moderator' && account.admin) {
          message = messages.demotedToModerator;
        } else if (role === 'moderator') {
          message = messages.promotedToModerator;
        } else if (role === 'user') {
          message = messages.demotedToUser;
        }

        if (message) {
          toast.success(intl.formatMessage(message, { acct: account.acct }));
        }
      })
      .catch(() => {});
  };

  const accountRole = getRole(account);

  return (
    <SelectDropdown
      items={roles}
      defaultValue={accountRole}
      onChange={handleRoleChange}
    />
  );
};

export default StaffRolePicker;