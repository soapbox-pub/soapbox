import React, { ChangeEventHandler } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  verifyUser,
  unverifyUser,
  setDonor,
  removeDonor,
  suggestUsers,
  unsuggestUsers,
} from 'soapbox/actions/admin';
import { deactivateUserModal, deleteUserModal } from 'soapbox/actions/moderation';
import snackbar from 'soapbox/actions/snackbar';
import Account from 'soapbox/components/account';
import List, { ListItem } from 'soapbox/components/list';
import MissingIndicator from 'soapbox/components/missing_indicator';
import { Button, Text, HStack, Modal, Stack, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import { isLocal } from 'soapbox/utils/accounts';

import StaffRolePicker from './staff-role-picker';

const getAccount = makeGetAccount();

const messages = defineMessages({
  userVerified: { id: 'admin.users.user_verified_message', defaultMessage: '@{acct} was verified' },
  userUnverified: { id: 'admin.users.user_unverified_message', defaultMessage: '@{acct} was unverified' },
  setDonorSuccess: { id: 'admin.users.set_donor_message', defaultMessage: '@{acct} was set as a donor' },
  removeDonorSuccess: { id: 'admin.users.remove_donor_message', defaultMessage: '@{acct} was removed as a donor' },
  userSuggested: { id: 'admin.users.user_suggested_message', defaultMessage: '@{acct} was suggested' },
  userUnsuggested: { id: 'admin.users.user_unsuggested_message', defaultMessage: '@{acct} was unsuggested' },
});

interface IAccountModerationModal {
  /** Action to close the modal. */
  onClose: (type: string) => void,
  /** ID of the account to moderate. */
  accountId: string,
}

/** Moderator actions against accounts. */
const AccountModerationModal: React.FC<IAccountModerationModal> = ({ onClose, accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const features = useFeatures();
  const account = useAppSelector(state => getAccount(state, accountId));

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

  const handleVerifiedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userVerified : messages.userUnverified;
    const action = checked ? verifyUser : unverifyUser;

    dispatch(action(account.id))
      .then(() => dispatch(snackbar.success(intl.formatMessage(message, { acct: account.acct }))))
      .catch(() => {});
  };

  const handleDonorChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.setDonorSuccess : messages.removeDonorSuccess;
    const action = checked ? setDonor : removeDonor;

    dispatch(action(account.id))
      .then(() => dispatch(snackbar.success(intl.formatMessage(message, { acct: account.acct }))))
      .catch(() => {});
  };

  const handleSuggestedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userSuggested : messages.userUnsuggested;
    const action = checked ? suggestUsers : unsuggestUsers;

    dispatch(action([account.id]))
      .then(() => dispatch(snackbar.success(intl.formatMessage(message, { acct: account.acct }))))
      .catch(() => {});
  };

  const handleDeactivate = () => {
    dispatch(deactivateUserModal(intl, account.id));
  };

  const handleDelete = () => {
    dispatch(deleteUserModal(intl, account.id));
  };

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

        <List>
          {isLocal(account) && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.account_role' defaultMessage='Staff level' />}>
              <div className='w-auto'>
                <StaffRolePicker account={account} />
              </div>
            </ListItem>
          )}

          <ListItem label={<FormattedMessage id='account_moderation_modal.fields.verified' defaultMessage='Verified account' />}>
            <Toggle
              checked={account.verified}
              onChange={handleVerifiedChange}
            />
          </ListItem>

          <ListItem label={<FormattedMessage id='account_moderation_modal.fields.donor' defaultMessage='Donor' />}>
            <Toggle
              checked={account.donor}
              onChange={handleDonorChange}
            />
          </ListItem>

          {features.suggestionsV2 && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.suggested' defaultMessage='Suggested in people to follow' />}>
              <Toggle
                checked={account.getIn(['pleroma', 'is_suggested']) === true}
                onChange={handleSuggestedChange}
              />
            </ListItem>
          )}
        </List>

        <List>
          <ListItem
            label={<FormattedMessage id='account_moderation_modal.fields.deactivate' defaultMessage='Deactivate account' />}
            onClick={handleDeactivate}
          />

          <ListItem
            label={<FormattedMessage id='account_moderation_modal.fields.delete' defaultMessage='Delete account' />}
            onClick={handleDelete}
          />
        </List>

        <Text theme='subtle' size='xs'>
          <FormattedMessage
            id='account_moderation_modal.info.id'
            defaultMessage='ID: {id}'
            values={{ id: account.id }}
          />
        </Text>

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
