'use strict';

import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { blockAccount, followAccount, pinAccount, removeFromFollowers, unblockAccount, unmuteAccount, unpinAccount } from 'soapbox/actions/accounts';
import { launchChat } from 'soapbox/actions/chats';
import { mentionCompose, directCompose } from 'soapbox/actions/compose';
import { blockDomain, unblockDomain } from 'soapbox/actions/domain-blocks';
import { openModal } from 'soapbox/actions/modals';
import { initMuteModal } from 'soapbox/actions/mutes';
import { initReport } from 'soapbox/actions/reports';
import { setSearchAccount } from 'soapbox/actions/search';
import { getSettings } from 'soapbox/actions/settings';
import snackbar from 'soapbox/actions/snackbar';
import Badge from 'soapbox/components/badge';
import StillImage from 'soapbox/components/still-image';
import { HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, MenuLink, MenuDivider, Avatar } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import MovedNote from 'soapbox/features/account-timeline/components/moved-note';
import ActionButton from 'soapbox/features/ui/components/action-button';
import SubscriptionButton from 'soapbox/features/ui/components/subscription-button';
import { useAppDispatch, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';
import { Account } from 'soapbox/types/entities';
import { isRemote } from 'soapbox/utils/accounts';

import type { Menu as MenuType } from 'soapbox/components/dropdown-menu';

const messages = defineMessages({
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
  mention: { id: 'account.mention', defaultMessage: 'Mention' },
  chat: { id: 'account.chat', defaultMessage: 'Chat with @{name}' },
  direct: { id: 'account.direct', defaultMessage: 'Direct message @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  share: { id: 'account.share', defaultMessage: 'Share @{name}\'s profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  hideReblogs: { id: 'account.hide_reblogs', defaultMessage: 'Hide reposts from @{name}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show reposts from @{name}' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domain_blocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Hidden domains' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: { id: 'account.unendorse', defaultMessage: 'Don\'t feature on profile' },
  removeFromFollowers: { id: 'account.remove_from_followers', defaultMessage: 'Remove this follower' },
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  add_or_remove_from_list: { id: 'account.add_or_remove_from_list', defaultMessage: 'Add or Remove from lists' },
  search: { id: 'account.search', defaultMessage: 'Search from @{name}' },
  searchSelf: { id: 'account.search_self', defaultMessage: 'Search your posts' },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
  removeFromFollowersConfirm: { id: 'confirmations.remove_from_followers.confirm', defaultMessage: 'Remove' },
  userEndorsed: { id: 'account.endorse.success', defaultMessage: 'You are now featuring @{acct} on your profile' },
  userUnendorsed: { id: 'account.unendorse.success', defaultMessage: 'You are no longer featuring @{acct}' },
  profileExternal: { id: 'account.profile_external', defaultMessage: 'View profile on {domain}' },
});

interface IHeader {
  account?: Account,
}

const Header: React.FC<IHeader> = ({ account }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const features = useFeatures();
  const ownAccount = useOwnAccount();

  if (!account) {
    return (
      <div className='-mt-4 -mx-4'>
        <div>
          <div className='relative h-32 w-full lg:h-48 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50' />
        </div>

        <div className='px-4 sm:px-6'>
          <div className='-mt-12 flex items-end space-x-5'>
            <div className='flex relative'>
              <div
                className='h-24 w-24 bg-gray-400 rounded-full ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onBlock = () => {
    if (account.relationship?.blocking) {
      dispatch(unblockAccount(account.id));
    } else {
      dispatch(openModal('CONFIRM', {
        icon: require('@tabler/icons/ban.svg'),
        heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
        message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.acct}</strong> }} />,
        confirm: intl.formatMessage(messages.blockConfirm),
        onConfirm: () => dispatch(blockAccount(account.id)),
        secondary: intl.formatMessage(messages.blockAndReport),
        onSecondary: () => {
          dispatch(blockAccount(account.id));
          dispatch(initReport(account));
        },
      }));
    }
  };

  const onMention = () => {
    dispatch(mentionCompose(account));
  };

  const onDirect = () => {
    dispatch(directCompose(account));
  };

  const onReblogToggle = () => {
    if (account.relationship?.showing_reblogs) {
      dispatch(followAccount(account.id, { reblogs: false }));
    } else {
      dispatch(followAccount(account.id, { reblogs: true }));
    }
  };

  const onEndorseToggle = () => {
    if (account.relationship?.endorsed) {
      dispatch(unpinAccount(account.id))
        .then(() => dispatch(snackbar.success(intl.formatMessage(messages.userUnendorsed, { acct: account.acct }))))
        .catch(() => {});
    } else {
      dispatch(pinAccount(account.id))
        .then(() => dispatch(snackbar.success(intl.formatMessage(messages.userEndorsed, { acct: account.acct }))))
        .catch(() => {});
    }
  };

  const onReport = () => {
    dispatch(initReport(account));
  };

  const onMute = () => {
    if (account.relationship?.muting) {
      dispatch(unmuteAccount(account.id));
    } else {
      dispatch(initMuteModal(account));
    }
  };

  const onBlockDomain = (domain: string) => {
    dispatch(openModal('CONFIRM', {
      icon: require('@tabler/icons/ban.svg'),
      heading: <FormattedMessage id='confirmations.domain_block.heading' defaultMessage='Block {domain}' values={{ domain }} />,
      message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable. You will not see content from that domain in any public timelines or your notifications.' values={{ domain: <strong>{domain}</strong> }} />,
      confirm: intl.formatMessage(messages.blockDomainConfirm),
      onConfirm: () => dispatch(blockDomain(domain)),
    }));
  };

  const onUnblockDomain = (domain: string) => {
    dispatch(unblockDomain(domain));
  };

  const onProfileExternal = (url: string) => {
    window.open(url, '_blank');
  };

  const onAddToList = () => {
    dispatch(openModal('LIST_ADDER', {
      accountId: account.id,
    }));
  };

  const onChat = () => {
    dispatch(launchChat(account.id, history));
  };

  const onModerate = () => {
    dispatch(openModal('ACCOUNT_MODERATION', { accountId: account.id }));
  };

  const onRemoveFromFollowers = () => {
    dispatch((_, getState) => {
      const unfollowModal = getSettings(getState()).get('unfollowModal');
      if (unfollowModal) {
        dispatch(openModal('CONFIRM', {
          message: <FormattedMessage id='confirmations.remove_from_followers.message' defaultMessage='Are you sure you want to remove {name} from your followers?' values={{ name: <strong>@{account.acct}</strong> }} />,
          confirm: intl.formatMessage(messages.removeFromFollowersConfirm),
          onConfirm: () => dispatch(removeFromFollowers(account.id)),
        }));
      } else {
        dispatch(removeFromFollowers(account.id));
      }
    });
  };

  const onSearch = () => {
    dispatch(setSearchAccount(account.id));
    history.push('/search');
  };

  const onAvatarClick = () => {
    const avatar = normalizeAttachment({
      type: 'image',
      url: account.avatar,
    });
    dispatch(openModal('MEDIA', { media: ImmutableList.of(avatar), index: 0 }));
  };

  const handleAvatarClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAvatarClick();
    }
  };

  const onHeaderClick = () => {
    const header = normalizeAttachment({
      type: 'image',
      url: account.header,
    });
    dispatch(openModal('MEDIA', { media: ImmutableList.of(header), index: 0 }));
  };

  const handleHeaderClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onHeaderClick();
    }
  };

  const handleShare = () => {
    navigator.share({
      text: `@${account.acct}`,
      url: account.url,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  const makeMenu = () => {
    const menu: MenuType = [];

    if (!account || !ownAccount) {
      return [];
    }

    if ('share' in navigator) {
      menu.push({
        text: intl.formatMessage(messages.share, { name: account.username }),
        action: handleShare,
        icon: require('@tabler/icons/upload.svg'),
      });
      menu.push(null);
    }

    if (account.id === ownAccount?.id) {
      menu.push({
        text: intl.formatMessage(messages.edit_profile),
        to: '/settings/profile',
        icon: require('@tabler/icons/user.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.preferences),
        to: '/settings',
        icon: require('@tabler/icons/settings.svg'),
      });
      if (features.searchFromAccount) {
        menu.push({
          text: intl.formatMessage(messages.searchSelf, { name: account.username }),
          action: onSearch,
          icon: require('@tabler/icons/search.svg'),
        });
      }
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mutes),
        to: '/mutes',
        icon: require('@tabler/icons/circle-x.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.blocks),
        to: '/blocks',
        icon: require('@tabler/icons/ban.svg'),
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: account.username }),
        action: onMention,
        icon: require('@tabler/icons/at.svg'),
      });

      if (account.getIn(['pleroma', 'accepts_chat_messages']) === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: account.username }),
          action: onChat,
          icon: require('@tabler/icons/messages.svg'),
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: account.username }),
          action: onDirect,
          icon: require('@tabler/icons/mail.svg'),
        });
      }

      if (account.relationship?.following) {
        if (account.relationship?.showing_reblogs) {
          menu.push({
            text: intl.formatMessage(messages.hideReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: require('@tabler/icons/repeat.svg'),
          });
        } else {
          menu.push({
            text: intl.formatMessage(messages.showReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: require('@tabler/icons/repeat.svg'),
          });
        }

        if (features.lists) {
          menu.push({
            text: intl.formatMessage(messages.add_or_remove_from_list),
            action: onAddToList,
            icon: require('@tabler/icons/list.svg'),
          });
        }

        if (features.accountEndorsements) {
          menu.push({
            text: intl.formatMessage(account.relationship?.endorsed ? messages.unendorse : messages.endorse),
            action: onEndorseToggle,
            icon: require('@tabler/icons/user-check.svg'),
          });
        }

        menu.push(null);
      } else if (features.lists && features.unrestrictedLists) {
        menu.push({
          text: intl.formatMessage(messages.add_or_remove_from_list),
          action: onAddToList,
          icon: require('@tabler/icons/list.svg'),
        });
      }

      if (features.searchFromAccount) {
        menu.push({
          text: intl.formatMessage(messages.search, { name: account.username }),
          action: onSearch,
          icon: require('@tabler/icons/search.svg'),
        });
      }

      if (features.removeFromFollowers && account.relationship?.followed_by) {
        menu.push({
          text: intl.formatMessage(messages.removeFromFollowers),
          action: onRemoveFromFollowers,
          icon: require('@tabler/icons/user-x.svg'),
        });
      }

      if (account.relationship?.muting) {
        menu.push({
          text: intl.formatMessage(messages.unmute, { name: account.username }),
          action: onMute,
          icon: require('@tabler/icons/circle-x.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.mute, { name: account.username }),
          action: onMute,
          icon: require('@tabler/icons/circle-x.svg'),
        });
      }

      if (account.relationship?.blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblock, { name: account.username }),
          action: onBlock,
          icon: require('@tabler/icons/ban.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.block, { name: account.username }),
          action: onBlock,
          icon: require('@tabler/icons/ban.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(messages.report, { name: account.username }),
        action: onReport,
        icon: require('@tabler/icons/flag.svg'),
      });
    }

    if (isRemote(account)) {
      const domain = account.fqn.split('@')[1];

      menu.push(null);

      if (account.relationship?.domain_blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblockDomain, { domain }),
          action: () => onUnblockDomain(domain),
          icon: require('@tabler/icons/ban.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.blockDomain, { domain }),
          action: () => onBlockDomain(domain),
          icon: require('@tabler/icons/ban.svg'),
        });
      }

      if (features.federating) {
        menu.push({
          text: intl.formatMessage(messages.profileExternal, { domain }),
          action: () => onProfileExternal(account.url),
          icon: require('@tabler/icons/external-link.svg'),
        });
      }
    }

    if (ownAccount?.staff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        action: onModerate,
        icon: require('@tabler/icons/gavel.svg'),
      });
    }

    return menu;
  };

  const makeInfo = () => {
    const info: React.ReactNode[] = [];

    if (!account || !ownAccount) return info;

    if (ownAccount?.id !== account.id && account.relationship?.followed_by) {
      info.push(
        <Badge
          key='followed_by'
          slug='opaque'
          title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
        />,
      );
    } else if (ownAccount?.id !== account.id && account.relationship?.blocking) {
      info.push(
        <Badge
          key='blocked'
          slug='opaque'
          title={<FormattedMessage id='account.blocked' defaultMessage='Blocked' />}
        />,
      );
    }

    if (ownAccount?.id !== account.id && account.relationship?.muting) {
      info.push(
        <Badge
          key='muted'
          slug='opaque'
          title={<FormattedMessage id='account.muted' defaultMessage='Muted' />}
        />,
      );
    } else if (ownAccount?.id !== account.id && account.relationship?.domain_blocking) {
      info.push(
        <Badge
          key='domain_blocked'
          slug='opaque'
          title={<FormattedMessage id='account.domain_blocked' defaultMessage='Domain hidden' />}
        />,
      );
    }

    return info;
  };

  // const renderMessageButton = () => {
  //   if (!ownAccount || !account || account.id === ownAccount?.id) {
  //     return null;
  //   }

  //   const canChat = account.getIn(['pleroma', 'accepts_chat_messages']) === true;

  //   if (canChat) {
  //     return (
  //       <IconButton
  //         src={require('@tabler/icons/messages.svg')}
  //         onClick={onChat}
  //         title={intl.formatMessage(messages.chat, { name: account.username })}
  //       />
  //     );
  //   } else {
  //     return (
  //       <IconButton
  //         src={require('@tabler/icons/mail.svg')}
  //         onClick={onDirect}
  //         title={intl.formatMessage(messages.direct, { name: account.username })}
  //         theme='outlined'
  //         className='px-2'
  //         iconClassName='w-4 h-4'
  //       />
  //     );
  //   }
  // };

  const renderShareButton = () => {
    const canShare = 'share' in navigator;

    if (!(account && ownAccount?.id && account.id === ownAccount?.id && canShare)) {
      return null;
    }

    return (
      <IconButton
        src={require('@tabler/icons/upload.svg')}
        onClick={handleShare}
        title={intl.formatMessage(messages.share, { name: account.username })}
        theme='outlined'
        className='px-2'
        iconClassName='w-4 h-4'
      />
    );
  };

  const info = makeInfo();
  const menu = makeMenu();

  return (
    <div className='-mt-4 -mx-4'>
      {(account.moved && typeof account.moved === 'object') && (
        <MovedNote from={account} to={account.moved} />
      )}

      <div>
        <div className='relative flex flex-col justify-center h-32 w-full lg:h-48 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50 overflow-hidden isolate'>
          {account.header && (
            <a href={account.header} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={account.header}
                alt='Profile Header'
              />
            </a>
          )}

          <div className='absolute top-2 left-2'>
            <HStack alignItems='center' space={1}>
              {info}
            </HStack>
          </div>
        </div>
      </div>

      <div className='px-4 sm:px-6'>
        <div className='-mt-12 flex items-end space-x-5'>
          <div className='flex'>
            <a href={account.avatar} onClick={handleAvatarClick} target='_blank'>
              <Avatar
                src={account.avatar}
                size={96}
                className='relative h-24 w-24 rounded-full ring-4 ring-white dark:ring-primary-900'
              />
            </a>
          </div>

          <div className='mt-6 flex justify-end w-full sm:pb-1'>
            <div className='mt-10 flex flex-row space-y-0 space-x-2'>
              <SubscriptionButton account={account} />

              {ownAccount && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    src={require('@tabler/icons/dots.svg')}
                    theme='outlined'
                    className='px-2'
                    iconClassName='w-4 h-4'
                    children={null}
                  />

                  <MenuList>
                    {menu.map((menuItem, idx) => {
                      if (typeof menuItem?.text === 'undefined') {
                        return <MenuDivider key={idx} />;
                      } else {
                        const Comp = (menuItem.action ? MenuItem : MenuLink) as any;
                        const itemProps = menuItem.action ? { onSelect: menuItem.action } : { to: menuItem.to, as: Link, target: menuItem.newTab ? '_blank' : '_self' };

                        return (
                          <Comp key={idx} {...itemProps} className='group'>
                            <div className='flex items-center'>
                              {menuItem.icon && (
                                <SvgIcon src={menuItem.icon} className='mr-3 h-5 w-5 text-gray-400 flex-none group-hover:text-gray-500' />
                              )}

                              <div className='truncate'>{menuItem.text}</div>
                            </div>
                          </Comp>
                        );
                      }
                    })}
                  </MenuList>
                </Menu>
              )}

              {renderShareButton()}
              {/* {renderMessageButton()} */}

              <ActionButton account={account} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
