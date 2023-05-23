import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import {
  followAccount,
  subscribeAccount,
  unsubscribeAccount,
} from 'soapbox/actions/accounts';
import { IconButton } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import type { Account, Relationship } from 'soapbox/schemas';

const messages = defineMessages({
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe to notifications from @{name}' },
  unsubscribe: { id: 'account.unsubscribe', defaultMessage: 'Unsubscribe to notifications from @{name}' },
  subscribeSuccess: { id: 'account.subscribe.success', defaultMessage: 'You have subscribed to this account.' },
  unsubscribeSuccess: { id: 'account.unsubscribe.success', defaultMessage: 'You have unsubscribed from this account.' },
  subscribeFailure: { id: 'account.subscribe.failure', defaultMessage: 'An error occurred trying to subscribe to this account.' },
  unsubscribeFailure: { id: 'account.unsubscribe.failure', defaultMessage: 'An error occurred trying to unsubscribe to this account.' },
});

interface ISubscriptionButton {
  account: Account
  relationship: Relationship | undefined
}

const SubscriptionButton: React.FC<ISubscriptionButton> = ({ account, relationship }) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const isFollowing = relationship?.following;
  const isRequested = relationship?.requested;
  const isSubscribed = features.accountNotifies
    ? relationship?.notifying
    : relationship?.subscribing;
  const title = isSubscribed
    ? intl.formatMessage(messages.unsubscribe, { name: account.username })
    : intl.formatMessage(messages.subscribe, { name: account.username });

  const onSubscribeSuccess = () =>
    toast.success(intl.formatMessage(messages.subscribeSuccess));

  const onSubscribeFailure = () =>
    toast.error(intl.formatMessage(messages.subscribeFailure));

  const onUnsubscribeSuccess = () =>
    toast.success(intl.formatMessage(messages.unsubscribeSuccess));

  const onUnsubscribeFailure = () =>
    toast.error(intl.formatMessage(messages.unsubscribeFailure));

  const onNotifyToggle = () => {
    if (relationship?.notifying) {
      dispatch(followAccount(account.id, { notify: false } as any))
        ?.then(() => onUnsubscribeSuccess())
        .catch(() => onUnsubscribeFailure());
    } else {
      dispatch(followAccount(account.id, { notify: true } as any))
        ?.then(() => onSubscribeSuccess())
        .catch(() => onSubscribeFailure());
    }
  };

  const onSubscriptionToggle = () => {
    if (relationship?.subscribing) {
      dispatch(unsubscribeAccount(account.id))
        ?.then(() => onUnsubscribeSuccess())
        .catch(() => onUnsubscribeFailure());
    } else {
      dispatch(subscribeAccount(account.id))
        ?.then(() => onSubscribeSuccess())
        .catch(() => onSubscribeFailure());
    }
  };

  const handleToggle = () => {
    if (features.accountNotifies) {
      onNotifyToggle();
    } else {
      onSubscriptionToggle();
    }
  };

  if (!features.accountSubscriptions && !features.accountNotifies) {
    return null;
  }

  if (isRequested || isFollowing) {
    return (
      <IconButton
        src={isSubscribed ? require('@tabler/icons/bell-ringing.svg') : require('@tabler/icons/bell.svg')}
        onClick={handleToggle}
        title={title}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  }

  return null;
};

export default SubscriptionButton;
