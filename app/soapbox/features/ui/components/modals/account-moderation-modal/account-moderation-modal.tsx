import React, { ChangeEventHandler, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setBadges as saveBadges } from 'soapbox/actions/admin';
import { deactivateUserModal, deleteUserModal } from 'soapbox/actions/moderation';
import { useAccount } from 'soapbox/api/hooks';
import { useSuggest, useVerify } from 'soapbox/api/hooks/admin';
import Account from 'soapbox/components/account';
import List, { ListItem } from 'soapbox/components/list';
import MissingIndicator from 'soapbox/components/missing-indicator';
import OutlineBox from 'soapbox/components/outline-box';
import { Button, Text, HStack, Modal, Stack, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures, useOwnAccount } from 'soapbox/hooks';
import toast from 'soapbox/toast';
import { isLocal } from 'soapbox/utils/accounts';
import { getBadges } from 'soapbox/utils/badges';

import BadgeInput from './badge-input';
import StaffRolePicker from './staff-role-picker';

const messages = defineMessages({
  userVerified: { id: 'admin.users.user_verified_message', defaultMessage: '@{acct} was verified' },
  userUnverified: { id: 'admin.users.user_unverified_message', defaultMessage: '@{acct} was unverified' },
  setDonorSuccess: { id: 'admin.users.set_donor_message', defaultMessage: '@{acct} was set as a donor' },
  removeDonorSuccess: { id: 'admin.users.remove_donor_message', defaultMessage: '@{acct} was removed as a donor' },
  userSuggested: { id: 'admin.users.user_suggested_message', defaultMessage: '@{acct} was suggested' },
  userUnsuggested: { id: 'admin.users.user_unsuggested_message', defaultMessage: '@{acct} was unsuggested' },
  badgesSaved: { id: 'admin.users.badges_saved_message', defaultMessage: 'Custom badges updated.' },
});

interface IAccountModerationModal {
  /** Action to close the modal. */
  onClose: (type: string) => void
  /** ID of the account to moderate. */
  accountId: string
}

/** Moderator actions against accounts. */
const AccountModerationModal: React.FC<IAccountModerationModal> = ({ onClose, accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { suggest, unsuggest } = useSuggest();
  const { verify, unverify } = useVerify();
  const { account: ownAccount } = useOwnAccount();
  const features = useFeatures();
  const { account } = useAccount(accountId);

  const accountBadges = account ? getBadges(account) : [];
  const [badges, setBadges] = useState<string[]>(accountBadges);

  const handleClose = () => onClose('ACCOUNT_MODERATION');

  if (!account || !ownAccount) {
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
    const action = checked ? verify : unverify;

    action([account.id], {
      onSuccess: () => toast.success(intl.formatMessage(message, { acct: account.acct })),
    });
  };

  const handleSuggestedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userSuggested : messages.userUnsuggested;
    const action = checked ? suggest : unsuggest;

    action([account.id], {
      onSuccess: () => toast.success(intl.formatMessage(message, { acct: account.acct })),
    });
  };

  const handleDeactivate = () => {
    dispatch(deactivateUserModal(intl, account.id));
  };

  const handleDelete = () => {
    dispatch(deleteUserModal(intl, account.id));
  };

  const handleSaveBadges = () => {
    dispatch(saveBadges(account.id, accountBadges, badges))
      .then(() => toast.success(intl.formatMessage(messages.badgesSaved)))
      .catch(() => {});
  };

  return (
    <Modal
      title={<FormattedMessage id='account_moderation_modal.title' defaultMessage='Moderate @{acct}' values={{ acct: account.acct }} />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <OutlineBox>
          <Account
            account={account}
            showProfileHoverCard={false}
            withLinkToProfile={false}
            hideActions
          />
        </OutlineBox>

        <List>
          {(ownAccount.admin && isLocal(account)) && (
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

          {features.suggestionsV2 && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.suggested' defaultMessage='Suggested in people to follow' />}>
              <Toggle
                checked={account.pleroma?.is_suggested === true}
                onChange={handleSuggestedChange}
              />
            </ListItem>
          )}

          <ListItem label={<FormattedMessage id='account_moderation_modal.fields.badges' defaultMessage='Custom badges' />}>
            <div className='grow'>
              <HStack className='w-full' alignItems='center' space={2}>
                <BadgeInput badges={badges} onChange={setBadges} />
                <Button onClick={handleSaveBadges}>
                  <FormattedMessage id='save' defaultMessage='Save' />
                </Button>
              </HStack>
            </div>
          </ListItem>
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
