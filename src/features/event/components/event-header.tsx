import alertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg';
import atIcon from '@tabler/icons/outline/at.svg';
import banIcon from '@tabler/icons/outline/ban.svg';
import bookmarkOffIcon from '@tabler/icons/outline/bookmark-off.svg';
import bookmarkIcon from '@tabler/icons/outline/bookmark.svg';
import calendarPlusIcon from '@tabler/icons/outline/calendar-plus.svg';
import circleXIcon from '@tabler/icons/outline/circle-x.svg';
import dotsIcon from '@tabler/icons/outline/dots.svg';
import externalLinkIcon from '@tabler/icons/outline/external-link.svg';
import flag3Icon from '@tabler/icons/outline/flag-3.svg';
import flagIcon from '@tabler/icons/outline/flag.svg';
import gavelIcon from '@tabler/icons/outline/gavel.svg';
import linkIcon from '@tabler/icons/outline/link.svg';
import mailIcon from '@tabler/icons/outline/mail.svg';
import mapPinIcon from '@tabler/icons/outline/map-pin.svg';
import messagesIcon from '@tabler/icons/outline/messages.svg';
import pencilIcon from '@tabler/icons/outline/pencil.svg';
import pinIcon from '@tabler/icons/outline/pin.svg';
import pinnedOffIcon from '@tabler/icons/outline/pinned-off.svg';
import quoteIcon from '@tabler/icons/outline/quote.svg';
import repeatIcon from '@tabler/icons/outline/repeat.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import usersIcon from '@tabler/icons/outline/users.svg';
import { List as ImmutableList } from 'immutable';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { blockAccount } from 'soapbox/actions/accounts.ts';
import { launchChat } from 'soapbox/actions/chats.ts';
import { directCompose, mentionCompose, quoteCompose } from 'soapbox/actions/compose.ts';
import { editEvent, fetchEventIcs } from 'soapbox/actions/events.ts';
import { toggleBookmark, togglePin, toggleReblog } from 'soapbox/actions/interactions.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { deleteStatusModal, toggleStatusSensitivityModal } from 'soapbox/actions/moderation.tsx';
import { initMuteModal } from 'soapbox/actions/mutes.ts';
import { initReport, ReportableEntities } from 'soapbox/actions/reports.ts';
import { deleteStatus } from 'soapbox/actions/statuses.ts';
import Icon from 'soapbox/components/icon.tsx';
import StillImage from 'soapbox/components/still-image.tsx';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon.tsx';
import { Button, HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuLink, MenuList, Stack, Text } from 'soapbox/components/ui/index.ts';
import VerificationBadge from 'soapbox/components/verification-badge.tsx';
import { useAppDispatch, useFeatures, useOwnAccount, useSettings } from 'soapbox/hooks/index.ts';
import copy from 'soapbox/utils/copy.ts';
import { download } from 'soapbox/utils/download.ts';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

import PlaceholderEventHeader from '../../placeholder/components/placeholder-event-header.tsx';
import EventActionButton from '../components/event-action-button.tsx';
import EventDate from '../components/event-date.tsx';

import type { Menu as MenuType } from 'soapbox/components/dropdown-menu/index.ts';
import type { Status as StatusEntity } from 'soapbox/types/entities.ts';

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
  status?: StatusEntity;
}

const EventHeader: React.FC<IEventHeader> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const features = useFeatures();
  const { boostModal } = useSettings();
  const { account: ownAccount } = useOwnAccount();
  const isStaff = ownAccount ? ownAccount.staff : false;
  const isAdmin = ownAccount ? ownAccount.admin : false;

  if (!status || !status.event) {
    return (
      <>
        <div className='-mx-4 -mt-4'>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <PlaceholderEventHeader />
      </>
    );
  }

  const account = status.account;
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
    const { uri } = status;

    copy(uri);
  };

  const handleBookmarkClick = () => {
    dispatch(toggleBookmark(status));
  };

  const handleReblogClick = () => {
    const modalReblog = () => dispatch(toggleReblog(status));
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
      icon: trashIcon,
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
      icon: banIcon,
      heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>{/* eslint-disable-line formatjs/no-literal-string-in-jsx */}@{account.acct}</strong> }} />,
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
        icon: calendarPlusIcon,
      },
      {
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: linkIcon,
      },
    ];

    if (features.federating && !account.local) {
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        icon: externalLinkIcon,
        href: status.uri,
        target: '_blank',
      });
    }

    if (!ownAccount) return menu;

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? bookmarkOffIcon : bookmarkIcon,
      });
    }

    if (['public', 'unlisted'].includes(status.visibility)) {
      menu.push({
        text: intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog),
        action: handleReblogClick,
        icon: repeatIcon,
      });

      if (features.quotePosts) {
        menu.push({
          text: intl.formatMessage(messages.quotePost),
          action: handleQuoteClick,
          icon: quoteIcon,
        });
      }
    }

    menu.push(null);

    if (ownAccount.id === account.id) {
      if (['public', 'unlisted'].includes(status.visibility)) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? pinnedOffIcon : pinIcon,
        });
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: trashIcon,
        destructive: true,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: atIcon,
      });

      if (status.getIn(['account', 'pleroma', 'accepts_chat_messages']) === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: username }),
          action: handleChatClick,
          icon: messagesIcon,
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: username }),
          action: handleDirectClick,
          icon: mailIcon,
        });
      }

      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: circleXIcon,
      });
      menu.push({
        text: intl.formatMessage(messages.block, { name: username }),
        action: handleBlockClick,
        icon: banIcon,
      });
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: flagIcon,
      });
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        action: handleModerate,
        icon: gavelIcon,
      });

      if (isAdmin) {
        menu.push({
          text: intl.formatMessage(messages.adminStatus),
          action: handleModerateStatus,
          icon: pencilIcon,
        });
      }

      menu.push({
        text: intl.formatMessage(status.sensitive === false ? messages.markStatusSensitive : messages.markStatusNotSensitive),
        action: handleToggleStatusSensitivity,
        icon: alertTriangleIcon,
      });

      if (account.id !== ownAccount?.id) {
        menu.push({
          text: intl.formatMessage(messages.deleteStatus),
          action: handleDeleteStatus,
          icon: trashIcon,
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
        <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48'>
          {banner && (
            <a href={banner.url} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={banner.url}
                alt={intl.formatMessage(messages.bannerHeader)}
                className='absolute inset-0 h-full object-cover black:rounded-t-none md:rounded-t-xl'
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
              src={dotsIcon}
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
                  const Comp = (menuItem.href ? MenuLink : MenuItem) as any;
                  const itemProps = menuItem.href ? { href: menuItem.href, target: menuItem.target || '_self' } : { onSelect: menuItem.action };

                  return (
                    <Comp key={idx} {...itemProps} className='group'>
                      <div className='flex items-center'>
                        {menuItem.icon && (
                          <SvgIcon src={menuItem.icon} className='mr-3 size-5 flex-none text-gray-400 group-hover:text-gray-500' />
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
            <Icon src={flag3Icon} />
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
            <Icon src={usersIcon} />
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
              <Icon src={mapPinIcon} />
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
