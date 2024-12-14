import atIcon from '@tabler/icons/outline/at.svg';
import bellRingingIcon from '@tabler/icons/outline/bell-ringing.svg';
import boltIcon from '@tabler/icons/outline/bolt.svg';
import briefcaseIcon from '@tabler/icons/outline/briefcase.svg';
import calendarEventIcon from '@tabler/icons/outline/calendar-event.svg';
import calendarTimeIcon from '@tabler/icons/outline/calendar-time.svg';
import chartBarIcon from '@tabler/icons/outline/chart-bar.svg';
import heartIcon from '@tabler/icons/outline/heart.svg';
import messagesIcon from '@tabler/icons/outline/messages.svg';
import moodHappyIcon from '@tabler/icons/outline/mood-happy.svg';
import pencilIcon from '@tabler/icons/outline/pencil.svg';
import repeatIcon from '@tabler/icons/outline/repeat.svg';
import userCheckIcon from '@tabler/icons/outline/user-check.svg';
import userPlusIcon from '@tabler/icons/outline/user-plus.svg';
import { useCallback } from 'react';
import { defineMessages, useIntl, IntlShape, MessageDescriptor, defineMessage, FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { mentionCompose } from 'soapbox/actions/compose.ts';
import { favourite, unreblog, unfavourite } from 'soapbox/actions/interactions.ts';
import { patchMe } from 'soapbox/actions/me.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { getSettings } from 'soapbox/actions/settings.ts';
import { hideStatus, revealStatus } from 'soapbox/actions/statuses.ts';
import Icon from 'soapbox/components/icon.tsx';
import Status from 'soapbox/components/status.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import Emoji from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import StatusContainer from 'soapbox/containers/status-container.tsx';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useReblog } from 'soapbox/hooks/useReblog.ts';
import { makeGetNotification } from 'soapbox/selectors/index.ts';
import toast from 'soapbox/toast.tsx';
import { emojifyText } from 'soapbox/utils/emojify.tsx';
import { NotificationType, validType } from 'soapbox/utils/notification.ts';

import type { ScrollPosition } from 'soapbox/components/status.tsx';
import type { Account as AccountEntity, Status as StatusLegacy, Notification as NotificationEntity } from 'soapbox/types/entities.ts';

const notificationForScreenReader = (intl: IntlShape, message: string, timestamp: Date) => {
  const output = [message];

  output.push(intl.formatDate(timestamp, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  return output.join(', ');
};

const buildLink = (account: AccountEntity): JSX.Element => (
  <bdi>
    <Link
      className='font-bold text-gray-800 hover:underline dark:text-gray-200'
      title={account.acct}
      to={`/@${account.acct}`}
    >
      {emojifyText(account.display_name, account.emojis)}
    </Link>
  </bdi>
);

const icons: Record<NotificationType, string> = {
  follow: userPlusIcon,
  follow_request: userPlusIcon,
  mention: atIcon,
  favourite: heartIcon,
  group_favourite: heartIcon,
  reblog: repeatIcon,
  group_reblog: repeatIcon,
  status: bellRingingIcon,
  poll: chartBarIcon,
  move: briefcaseIcon,
  'pleroma:chat_mention': messagesIcon,
  'pleroma:emoji_reaction': moodHappyIcon,
  user_approved: userPlusIcon,
  update: pencilIcon,
  'pleroma:event_reminder': calendarTimeIcon,
  'pleroma:participation_request': calendarEventIcon,
  'pleroma:participation_accepted': calendarEventIcon,
  'ditto:name_grant': userCheckIcon,
  'ditto:zap': boltIcon,
};

const nameMessage = defineMessage({
  id: 'notification.name',
  defaultMessage: '{link}{others}',
});

const notificationMessages: Record<NotificationType, MessageDescriptor> = defineMessages({
  follow: {
    id: 'notification.follow',
    defaultMessage: '{name} followed you',
  },
  follow_request: {
    id: 'notification.follow_request',
    defaultMessage: '{name} has requested to follow you',
  },
  mention: {
    id: 'notification.mentioned',
    defaultMessage: '{name} mentioned you',
  },
  favourite: {
    id: 'notification.favourite',
    defaultMessage: '{name} liked your post',
  },
  group_favourite: {
    id: 'notification.group_favourite',
    defaultMessage: '{name} liked your group post',
  },
  reblog: {
    id: 'notification.reblog',
    defaultMessage: '{name} reposted your post',
  },
  group_reblog: {
    id: 'notification.group_reblog',
    defaultMessage: '{name} reposted your group post',
  },
  status: {
    id: 'notification.status',
    defaultMessage: '{name} just posted',
  },
  poll: {
    id: 'notification.poll',
    defaultMessage: 'A poll you have voted in has ended',
  },
  move: {
    id: 'notification.move',
    defaultMessage: '{name} moved to {targetName}',
  },
  'pleroma:chat_mention': {
    id: 'notification.pleroma:chat_mention',
    defaultMessage: '{name} sent you a message',
  },
  'pleroma:emoji_reaction': {
    id: 'notification.pleroma:emoji_reaction',
    defaultMessage: '{name} reacted to your post',
  },
  user_approved: {
    id: 'notification.user_approved',
    defaultMessage: 'Welcome to {instance}!',
  },
  update: {
    id: 'notification.update',
    defaultMessage: '{name} edited a post you interacted with',
  },
  'pleroma:event_reminder': {
    id: 'notification.pleroma:event_reminder',
    defaultMessage: 'An event you are participating in starts soon',
  },
  'pleroma:participation_request': {
    id: 'notification.pleroma:participation_request',
    defaultMessage: '{name} wants to join your event',
  },
  'pleroma:participation_accepted': {
    id: 'notification.pleroma:participation_accepted',
    defaultMessage: 'You were accepted to join the event',
  },
  'ditto:name_grant': {
    id: 'notification.ditto:name_grant',
    defaultMessage: 'You were granted the name {acct}',
  },
  'ditto:zap': {
    id: 'notification.ditto:zap',
    defaultMessage: '{name} zapped you {amount} sats',
  },
});

const messages = defineMessages({
  updateNameSuccess: { id: 'notification.update_name_success', defaultMessage: 'Name updated successfully' },
});

const buildMessage = (
  intl: IntlShape,
  type: NotificationType,
  account: AccountEntity,
  acct: string | undefined,
  targetName: string,
  instanceTitle: string,
  amount: number,
): React.ReactNode => {
  const link = buildLink(account);
  const name = intl.formatMessage(nameMessage, {
    link,
    others: '',
  });

  return intl.formatMessage(notificationMessages[type], {
    acct,
    amount,
    name,
    targetName,
    instance: instanceTitle,
  });
};

const avatarSize = 48;

interface INotification {
  hidden?: boolean;
  notification: NotificationEntity;
  onMoveUp?: (notificationId: string) => void;
  onMoveDown?: (notificationId: string) => void;
  onReblog?: (status: StatusLegacy, e?: KeyboardEvent) => void;
  getScrollPosition?: () => ScrollPosition | undefined;
  updateScrollBottom?: (bottom: number) => void;
}

const Notification: React.FC<INotification> = (props) => {
  const { hidden = false, onMoveUp, onMoveDown } = props;

  const dispatch = useAppDispatch();

  const getNotification = useCallback(makeGetNotification(), []);

  const notification = useAppSelector((state) => getNotification(state, props.notification));

  const history = useHistory();
  const intl = useIntl();
  const { instance } = useInstance();
  const { reblog } = useReblog();

  const type = notification.type;
  const { account, status } = notification;

  const getHandlers = () => ({
    reply: handleMention,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleMention,
    open: handleOpen,
    openProfile: handleOpenProfile,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    toggleHidden: handleHotkeyToggleHidden,
  });

  const handleOpen = () => {
    if (status && typeof status === 'object' && account && typeof account === 'object') {
      history.push(`/@${account.acct}/posts/${status.id}`);
    } else {
      handleOpenProfile();
    }
  };

  const handleOpenProfile = () => {
    if (account && typeof account === 'object') {
      history.push(`/@${account.acct}`);
    }
  };

  const handleMention = useCallback((e?: KeyboardEvent) => {
    e?.preventDefault();

    if (account && typeof account === 'object') {
      dispatch(mentionCompose(account));
    }
  }, [account]);

  const handleHotkeyFavourite = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      if (status.favourited) {
        dispatch(unfavourite(status));
      } else {
        dispatch(favourite(status));
      }
    }
  }, [status]);

  const handleHotkeyBoost = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      dispatch((_, getState) => {
        const boostModal = getSettings(getState()).get('boostModal');
        if (status.reblogged) {
          dispatch(unreblog(status));
        } else {
          if (e?.shiftKey || !boostModal) {
            reblog(status.id);
          } else {
            dispatch(openModal('BOOST', { status: status.toJS(), onReblog: (status: StatusLegacy) => {
              reblog(status.id);
            } }));
          }
        }
      });
    }
  }, [status]);

  const handleHotkeyToggleHidden = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      if (status.hidden) {
        dispatch(revealStatus(status.id));
      } else {
        dispatch(hideStatus(status.id));
      }
    }
  }, [status]);

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(notification.id);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(notification.id);
    }
  };

  const updateName = async (name: string) => {
    await dispatch(patchMe({ nip05: name }));
    toast.success(messages.updateNameSuccess);
  };

  const renderIcon = (): React.ReactNode => {
    if (type === 'pleroma:emoji_reaction' && notification.emoji) {
      if (notification.emoji_url) {
        return <img src={notification.emoji_url} alt={notification.emoji} className='size-4 flex-none' />;
      } else {
        return <Emoji emoji={notification.emoji} />;
      }
    } else if (validType(type)) {
      return (
        <Icon
          src={icons[type]}
          className='flex-none text-primary-600 dark:text-primary-400'
        />
      );
    } else {
      return null;
    }
  };

  const renderContent = () => {
    switch (type as NotificationType) {
      case 'follow':
      case 'ditto:zap':
        if (!status) {
          return account && typeof account === 'object' ? (
            <AccountContainer
              id={account.id}
              hidden={hidden}
              avatarSize={avatarSize}
              withRelationship
            />
          ) : null;
        } else {
          return status && typeof status === 'object' ? (
            <Status
              id={status.id}
              status={status}
              hidden={hidden}
              onMoveDown={handleMoveDown}
              onMoveUp={handleMoveUp}
              avatarSize={avatarSize}
              showGroup={false}
            />
          ) : null;
        }
      case 'user_approved':
        return account && typeof account === 'object' ? (
          <AccountContainer
            id={account.id}
            hidden={hidden}
            avatarSize={avatarSize}
            withRelationship
          />
        ) : null;
      case 'follow_request':
        return account && typeof account === 'object' ? (
          <AccountContainer
            id={account.id}
            hidden={hidden}
            avatarSize={avatarSize}
            actionType='follow_request'
            withRelationship
          />
        ) : null;
      case 'move':
        return account && typeof account === 'object' && notification.target && typeof notification.target === 'object' ? (
          <AccountContainer
            id={notification.target.id}
            hidden={hidden}
            avatarSize={avatarSize}
            withRelationship
          />
        ) : null;
      case 'favourite':
      case 'group_favourite':
      case 'mention':
      case 'reblog':
      case 'group_reblog':
      case 'status':
      case 'poll':
      case 'update':
      case 'pleroma:emoji_reaction':
      case 'pleroma:event_reminder':
      case 'pleroma:participation_accepted':
      case 'pleroma:participation_request':
        return status && typeof status === 'object' ? (
          <StatusContainer
            id={status.id}
            hidden={hidden}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            avatarSize={avatarSize}
            contextType='notifications'
            showGroup={false}
          />
        ) : null;
      case 'ditto:name_grant':
        return (
          <Stack className='p-4'>
            <Button onClick={() => updateName(notification.name)}>
              <FormattedMessage
                id='notification.set_name' defaultMessage='Set name to {name}'
                values={{ name: notification.name }}
              />
            </Button>
          </Stack>
        );
      default:
        return null;
    }
  };

  const acct = notification.name;
  const targetName = notification.target && typeof notification.target === 'object' ? notification.target.acct : '';

  const message: React.ReactNode = validType(type) && account && typeof account === 'object' ? buildMessage(intl, type, account, acct, targetName, instance.title, notification.amount / 1000) : null;

  const ariaLabel = validType(type) ? (
    notificationForScreenReader(
      intl,
      intl.formatMessage(notificationMessages[type], {
        acct,
        name: account && typeof account === 'object' ? account.acct : '',
        targetName,
      }),
      notification.created_at,
    )
  ) : '';

  return (
    <HotKeys handlers={getHandlers()} data-testid='notification'>
      <div
        className='notification focusable'
        tabIndex={0}
        aria-label={ariaLabel}
      >
        <div className='focusable p-4'>
          <div className='mb-2'>
            <HStack alignItems='center' space={3}>
              <div
                className='flex justify-end'
                style={{ flexBasis: avatarSize }}
              >
                {renderIcon()}
              </div>

              <div className='truncate'>
                <Text
                  theme='muted'
                  size='xs'
                  truncate
                  data-testid='message'
                >
                  {message}
                </Text>
              </div>
            </HStack>
          </div>

          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </HotKeys>
  );
};

export default Notification;
