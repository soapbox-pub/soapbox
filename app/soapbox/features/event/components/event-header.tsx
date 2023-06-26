import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { blockAccount } from 'soapbox/actions/accounts';
import { launchChat } from 'soapbox/actions/chats';
import { directCompose, mentionCompose, quoteCompose } from 'soapbox/actions/compose';
import { editEvent, fetchEventIcs } from 'soapbox/actions/events';
import { toggleBookmark, togglePin, toggleReblog } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { deleteStatusModal, toggleStatusSensitivityModal } from 'soapbox/actions/moderation';
import { initMuteModal } from 'soapbox/actions/mutes';
import { initReport, ReportableEntities } from 'soapbox/actions/reports';
import { deleteStatus } from 'soapbox/actions/statuses';
import Icon from 'soapbox/components/icon';
import StillImage from 'soapbox/components/still-image';
import { Button, HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuLink, MenuList, Stack, Text } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import VerificationBadge from 'soapbox/components/verification-badge';
import { useAppDispatch, useFeatures, useOwnAccount, useSettings } from 'soapbox/hooks';
import { isRemote } from 'soapbox/utils/accounts';
import copy from 'soapbox/utils/copy';
import { download } from 'soapbox/utils/download';
import { shortNumberFormat } from 'soapbox/utils/numbers';

import PlaceholderEventHeader from '../../placeholder/components/placeholder-event-header';
import EventActionButton from '../components/event-action-button';
import EventDate from '../components/event-date';

import type { Menu as MenuType } from 'soapbox/components/dropdown-menu';
import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  bannerHeader: { id: 'event.banner', defaultMessage: 'Event banner' },
  exportIcs: { id: 'event.export_ics', defaultMessage: 'Export to your calendar' },
  copy: { id: 'event.copy', defaultMessage: 'Copy link to event' },
  external: { id: 'event.external', defaultMessage: 'View event on {domain}' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  quotePost: { id: 'event.quote', defaultMessage: 'Quote event' },
  reblog: { id: 'event.reblog', defaultMessage: 'Repost event' },
  unreblog: { id: 'event.unreblog', defaultMessage: 'Un-repost event' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  chat: { id: 'status.chat', defaultMessage: 'Chat with @{name}' },
  direct: { id: 'status.direct', defaultMessage: 'Direct message @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  adminStatus: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  markStatusSensitive: { id: 'admin.statuses.actions.mark_status_sensitive', defaultMessage: 'Mark post sensitive' },
  markStatusNotSensitive: { id: 'admin.statuses.actions.mark_status_not_sensitive', defaultMessage: 'Mark post not sensitive' },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
  deleteConfirm: { id: 'confirmations.delete_event.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete_event.heading', defaultMessage: 'Delete event' },
  deleteMessage: { id: 'confirmations.delete_event.message', defaultMessage: 'Are you sure you want to delete this event?' },
});

interface IEventHeader {
  status?: StatusEntity
}

const EventHeader: React.FC<IEventHeader> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const features = useFeatures();
  const settings = useSettings();
  const { account: ownAccount } = useOwnAccount();
  const isStaff = ownAccount ? ownAccount.staff : false;
  const isAdmin = ownAccount ? ownAccount.admin : false;

  if (!status || !status.event) {
    return (
      <>
        <div className='-mx-4 -mt-4'>
          <div className='relative h-32 w-full bg-gray-200 dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <PlaceholderEventHeader />
      </>
    );
  }

  const account = status.account as AccountEntity;
  const event = status.event;
  const banner = event.banner;

  const username = account.username;

  const handleHeaderClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(openModal('MEDIA', { media: ImmutableList([event.banner]) }));
  };

  const handleExportClick = () => {
    dispatch(fetchEventIcs(status.id)).then(({ data }) => {
      download(data, 'calendar.ics');
    }).catch(() => {});
  };

  const handleCopy = () => {
    const { uri }  = status;

    copy(uri);
  };

  const handleExternalClick = () => {
    window.open(status.uri, '_blank');
  };

  const handleBookmarkClick = () => {
    dispatch(toggleBookmark(status));
  };

  const handleReblogClick = () => {
    const modalReblog = () => dispatch(toggleReblog(status));
    const boostModal = settings.get('boostModal');
    if (!boostModal) {
      modalReblog();
    } else {
      dispatch(openModal('BOOST', { status, onReblog: modalReblog }));
    }
  };

  const handleQuoteClick = () => {
    dispatch(quoteCompose(status));
  };

  const handlePinClick = () => {
    dispatch(togglePin(status));
  };

  const handleDeleteClick = () => {
    dispatch(openModal('CONFIRM', {
      icon: require('@tabler/icons/trash.svg'),
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => dispatch(deleteStatus(status.id)),
    }));
  };

  const handleMentionClick = () => {
    dispatch(mentionCompose(account));
  };

  const handleChatClick = () => {
    dispatch(launchChat(account.id, history));
  };

  const handleDirectClick = () => {
    dispatch(directCompose(account));
  };

  const handleMuteClick = () => {
    dispatch(initMuteModal(account));
  };

  const handleBlockClick = () => {
    dispatch(openModal('CONFIRM', {
      icon: require('@tabler/icons/ban.svg'),
      heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.acct}</strong> }} />,
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.id)),
      secondary: intl.formatMessage(messages.blockAndReport),
      onSecondary: () => {
        dispatch(blockAccount(account.id));
        dispatch(initReport(ReportableEntities.STATUS, account, { status }));
      },
    }));
  };

  const handleReport = () => {
    dispatch(initReport(ReportableEntities.STATUS, account, { status }));
  };

  const handleModerate = () => {
    dispatch(openModal('ACCOUNT_MODERATION', { accountId: account.id }));
  };

  const handleModerateStatus = () => {
    window.open(`/pleroma/admin/#/statuses/${status.id}/`, '_blank');
  };

  const handleToggleStatusSensitivity = () => {
    dispatch(toggleStatusSensitivityModal(intl, status.id, status.sensitive));
  };

  const handleDeleteStatus = () => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const makeMenu = (): MenuType => {
    const domain = account.fqn.split('@')[1];

    const menu: MenuType = [
      {
        text: intl.formatMessage(messages.exportIcs),
        action: handleExportClick,
        icon: require('@tabler/icons/calendar-plus.svg'),
      },
      {
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: require('@tabler/icons/link.svg'),
      },
    ];

    if (features.federating && isRemote(account)) {
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        action: handleExternalClick,
        icon: require('@tabler/icons/external-link.svg'),
      });
    }

    if (!ownAccount) return menu;

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? require('@tabler/icons/bookmark-off.svg') : require('@tabler/icons/bookmark.svg'),
      });
    }

    if (['public', 'unlisted'].includes(status.visibility)) {
      menu.push({
        text: intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog),
        action: handleReblogClick,
        icon: require('@tabler/icons/repeat.svg'),
      });

      if (features.quotePosts) {
        menu.push({
          text: intl.formatMessage(messages.quotePost),
          action: handleQuoteClick,
          icon: require('@tabler/icons/quote.svg'),
        });
      }
    }

    menu.push(null);

    if (ownAccount.id === account.id) {
      if (['public', 'unlisted'].includes(status.visibility)) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? require('@tabler/icons/pinned-off.svg') : require('@tabler/icons/pin.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: require('@tabler/icons/trash.svg'),
        destructive: true,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: require('@tabler/icons/at.svg'),
      });

      if (status.getIn(['account', 'pleroma', 'accepts_chat_messages']) === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: username }),
          action: handleChatClick,
          icon: require('@tabler/icons/messages.svg'),
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: username }),
          action: handleDirectClick,
          icon: require('@tabler/icons/mail.svg'),
        });
      }

      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: require('@tabler/icons/circle-x.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.block, { name: username }),
        action: handleBlockClick,
        icon: require('@tabler/icons/ban.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: require('@tabler/icons/flag.svg'),
      });
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        action: handleModerate,
        icon: require('@tabler/icons/gavel.svg'),
      });

      if (isAdmin) {
        menu.push({
          text: intl.formatMessage(messages.adminStatus),
          action: handleModerateStatus,
          icon: require('@tabler/icons/pencil.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(status.sensitive === false ? messages.markStatusSensitive : messages.markStatusNotSensitive),
        action: handleToggleStatusSensitivity,
        icon: require('@tabler/icons/alert-triangle.svg'),
      });

      if (account.id !== ownAccount?.id) {
        menu.push({
          text: intl.formatMessage(messages.deleteStatus),
          action: handleDeleteStatus,
          icon: require('@tabler/icons/trash.svg'),
          destructive: true,
        });
      }
    }

    return menu;
  };

  const handleManageClick: React.MouseEventHandler = e => {
    e.stopPropagation();

    dispatch(editEvent(status.id));
  };

  const handleParticipantsClick: React.MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();

    if (!ownAccount) {
      dispatch(openModal('UNAUTHORIZED'));
    } else {
      dispatch(openModal('EVENT_PARTICIPANTS', {
        statusId: status.id,
      }));
    }
  };

  return (
    <>
      <div className='-mx-4 -mt-4'>
        <div className='relative h-32 w-full bg-gray-200 dark:bg-gray-900/50 md:rounded-t-xl lg:h-48'>
          {banner && (
            <a href={banner.url} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={banner.url}
                alt={intl.formatMessage(messages.bannerHeader)}
                className='absolute inset-0 h-full object-cover md:rounded-t-xl'
              />
            </a>
          )}
        </div>
      </div>
      <Stack space={2}>
        <HStack className='w-full' alignItems='start' space={2}>
          <Text className='grow' size='lg' weight='bold'>{event.name}</Text>
          <Menu>
            <MenuButton
              as={IconButton}
              src={require('@tabler/icons/dots.svg')}
              theme='outlined'
              className='h-[30px] px-2'
              iconClassName='h-4 w-4'
              children={null}
            />

            <MenuList>
              {makeMenu().map((menuItem, idx) => {
                if (typeof menuItem?.text === 'undefined') {
                  return <MenuDivider key={idx} />;
                } else {
                  const Comp = (menuItem.action ? MenuItem : MenuLink) as any;
                  const itemProps = menuItem.action ? { onSelect: menuItem.action } : { to: menuItem.to, as: Link, target: menuItem.target || '_self' };

                  return (
                    <Comp key={idx} {...itemProps} className='group'>
                      <div className='flex items-center'>
                        {menuItem.icon && (
                          <SvgIcon src={menuItem.icon} className='mr-3 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500' />
                        )}

                        <div className='truncate'>{menuItem.text}</div>
                      </div>
                    </Comp>
                  );
                }
              })}
            </MenuList>
          </Menu>
          {account.id === ownAccount?.id ? (
            <Button
              size='sm'
              theme='secondary'
              onClick={handleManageClick}
            >
              <FormattedMessage id='event.manage' defaultMessage='Manage' />
            </Button>
          ) : <EventActionButton status={status} />}
        </HStack>

        <Stack space={1}>
          <HStack alignItems='center' space={2}>
            <Icon src={require('@tabler/icons/flag-3.svg')} />
            <span>
              <FormattedMessage
                id='event.organized_by'
                defaultMessage='Organized by {name}'
                values={{
                  name: (
                    <Link className='mention inline-block' to={`/@${account.acct}`}>
                      <HStack space={1} alignItems='center' grow>
                        <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />
                        {account.verified && <VerificationBadge />}
                      </HStack>
                    </Link>
                  ),
                }}
              />
            </span>
          </HStack>

          <HStack alignItems='center' space={2}>
            <Icon src={require('@tabler/icons/users.svg')} />
            <a href='#' className='hover:underline' onClick={handleParticipantsClick}>
              <span>
                <FormattedMessage
                  id='event.participants'
                  defaultMessage='{count} {rawCount, plural, one {person} other {people}} going'
                  values={{
                    rawCount: event.participants_count || 0,
                    count: shortNumberFormat(event.participants_count || 0),
                  }}
                />
              </span>
            </a>
          </HStack>

          <EventDate status={status} />

          {event.location && (
            <HStack alignItems='center' space={2}>
              <Icon src={require('@tabler/icons/map-pin.svg')} />
              <span>
                {event.location.get('name')}
              </span>
            </HStack>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default EventHeader;
