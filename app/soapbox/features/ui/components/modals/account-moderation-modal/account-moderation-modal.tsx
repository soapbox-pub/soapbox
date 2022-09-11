import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl, MessageDescriptor } from 'react-intl';

import { setRole } from 'soapbox/actions/admin';
import snackbar from 'soapbox/actions/snackbar';
import Account from 'soapbox/components/account';
import List, { ListItem } from 'soapbox/components/list';
import MissingIndicator from 'soapbox/components/missing_indicator';
import { Button, HStack, Modal, Stack } from 'soapbox/components/ui';
import { SelectDropdown } from 'soapbox/features/forms';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import { isLocal } from 'soapbox/utils/accounts';

import type { Account as AccountEntity } from 'soapbox/types/entities';

const getAccount = makeGetAccount();

const messages = defineMessages({
  roleUser: { id: 'account_moderation_modal.roles.user', defaultMessage: 'User' },
  roleModerator: { id: 'account_moderation_modal.roles.moderator', defaultMessage: 'Moderator' },
  roleAdmin: { id: 'account_moderation_modal.roles.admin', defaultMessage: 'Admin' },
  promotedToAdmin: { id: 'admin.users.actions.promote_to_admin_message', defaultMessage: '@{acct} was promoted to an admin' },
  promotedToModerator: { id: 'admin.users.actions.promote_to_moderator_message', defaultMessage: '@{acct} was promoted to a moderator' },
  demotedToModerator: { id: 'admin.users.actions.demote_to_moderator_message', defaultMessage: '@{acct} was demoted to a moderator' },
  demotedToUser: { id: 'admin.users.actions.demote_to_user_message', defaultMessage: '@{acct} was demoted to a regular user' },
});

interface IAccountModerationModal {
  /** Action to close the modal. */
  onClose: (type: string) => void,
  /** ID of the account to moderate. */
  accountId: string,
}

/** Staff role. */
type AccountRole = 'user' | 'moderator' | 'admin';

/** Get the highest staff role associated with the account. */
const getRole = (account: AccountEntity): AccountRole => {
  if (account.admin) {
    return 'admin';
  } else if (account.moderator) {
    return 'moderator';
  } else {
    return 'user';
  }
};

/** Moderator actions against accounts. */
const AccountModerationModal: React.FC<IAccountModerationModal> = ({ onClose, accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const features = useFeatures();
  const account = useAppSelector(state => getAccount(state, accountId));

  const roles: Record<AccountRole, string> = useMemo(() => ({
    user: intl.formatMessage(messages.roleUser),
    moderator: intl.formatMessage(messages.roleModerator),
    admin: intl.formatMessage(messages.roleAdmin),
  }), []);

  const handleClose = () => onClose('ACCOUNT_MODERATION');

  if (!account) {
    return (
      <Modal onClose={handleClose}>
        <MissingIndicator />
      </Modal>
    );
  }

  const handleAdminFE = () => {
    window.open(`/pleroma/admin/#/users/${account.id}/`, '_blank');
  };

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
          dispatch(snackbar.success(intl.formatMessage(message, { acct: account.acct })));
        }
      })
      .catch(() => {});
  };

  const accountRole = getRole(account);

  return (
    <Modal
      title={<FormattedMessage id='account_moderation_modal.title' defaultMessage='Moderate @{acct}' values={{ acct: account.acct }} />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <div className='p-4 rounded-lg border border-solid border-gray-300 dark:border-gray-800'>
          <Account
            account={account}
            showProfileHoverCard={false}
            withLinkToProfile={false}
            hideActions
          />
        </div>

        {isLocal(account) && (
          <List>
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.account_role' defaultMessage='Staff level' />}>
              <SelectDropdown
                items={roles}
                defaultValue={accountRole}
                onChange={handleRoleChange}
              />
            </ListItem>
          </List>
        )}

        {features.adminFE && (
          <HStack justifyContent='center'>
            <Button icon={require('@tabler/icons/external-link.svg')} size='sm' theme='secondary' onClick={handleAdminFE}>
              <FormattedMessage id='account_moderation_modal.admin_fe' defaultMessage='Open in AdminFE' />
            </Button>
          </HStack>
        )}
      </Stack>
    </Modal>
  );
};

export default AccountModerationModal;
