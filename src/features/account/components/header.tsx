import atIcon from '@tabler/icons/outline/at.svg';
import banIcon from '@tabler/icons/outline/ban.svg';
import boltIcon from '@tabler/icons/outline/bolt.svg';
import circleXIcon from '@tabler/icons/outline/circle-x.svg';
import clipboardCopyIcon from '@tabler/icons/outline/clipboard-copy.svg';
import dotsIcon from '@tabler/icons/outline/dots.svg';
import externalLinkIcon from '@tabler/icons/outline/external-link.svg';
import flagIcon from '@tabler/icons/outline/flag.svg';
import gavelIcon from '@tabler/icons/outline/gavel.svg';
import listIcon from '@tabler/icons/outline/list.svg';
import mailIcon from '@tabler/icons/outline/mail.svg';
import messagesIcon from '@tabler/icons/outline/messages.svg';
import repeatIcon from '@tabler/icons/outline/repeat.svg';
import rssIcon from '@tabler/icons/outline/rss.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import settingsIcon from '@tabler/icons/outline/settings.svg';
import uploadIcon from '@tabler/icons/outline/upload.svg';
import userCheckIcon from '@tabler/icons/outline/user-check.svg';
import userXIcon from '@tabler/icons/outline/user-x.svg';
import userIcon from '@tabler/icons/outline/user.svg';
import { useMutation } from '@tanstack/react-query';
import { List as ImmutableList } from 'immutable';
import { nip19 } from 'nostr-tools';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { blockAccount, pinAccount, removeFromFollowers, unblockAccount, unmuteAccount, unpinAccount } from 'soapbox/actions/accounts.ts';
import { mentionCompose, directCompose } from 'soapbox/actions/compose.ts';
import { blockDomain, unblockDomain } from 'soapbox/actions/domain-blocks.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { initMuteModal } from 'soapbox/actions/mutes.ts';
import { initReport, ReportableEntities } from 'soapbox/actions/reports.ts';
import { setSearchAccount } from 'soapbox/actions/search.ts';
import { getSettings } from 'soapbox/actions/settings.ts';
import { HTTPError } from 'soapbox/api/HTTPError.ts';
import { useFollow } from 'soapbox/api/hooks/index.ts';
import Badge from 'soapbox/components/badge.tsx';
import DropdownMenu, { Menu } from 'soapbox/components/dropdown-menu/index.ts';
import StillImage from 'soapbox/components/still-image.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import VerificationBadge from 'soapbox/components/verification-badge.tsx';
import MovedNote from 'soapbox/features/account-timeline/components/moved-note.tsx';
import ActionButton from 'soapbox/features/ui/components/action-button.tsx';
import SubscriptionButton from 'soapbox/features/ui/components/subscription-button.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { normalizeAttachment } from 'soapbox/normalizers/index.ts';
import { ChatKeys, useChats } from 'soapbox/queries/chats.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { Account } from 'soapbox/schemas/index.ts';
import toast from 'soapbox/toast.tsx';
import { isDefaultHeader } from 'soapbox/utils/accounts.ts';
import copy from 'soapbox/utils/copy.ts';
import { MASTODON, parseVersion } from 'soapbox/utils/features.ts';

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
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  npub: { id: 'account.npub', defaultMessage: 'Copy user npub' },
  share: { id: 'account.share', defaultMessage: 'Share @{name}\'s profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  hideReblogs: { id: 'account.hide_reblogs', defaultMessage: 'Hide reposts from @{name}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show reposts from @{name}' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocks' },
  domain_blocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Domain blocks' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Mutes' },
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
  header: { id: 'account.header.alt', defaultMessage: 'Profile header' },
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
  zap: { id: 'zap.send_to', defaultMessage: 'Send zaps to {target}' },
});

interface IHeader {
  account?: Account;
}

const Header: React.FC<IHeader> = ({ account }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const features = useFeatures();
  const { account: ownAccount } = useOwnAccount();
  const { follow } = useFollow();

  const { software } = useAppSelector((state) => parseVersion(state.instance.version));

  const { getOrCreateChatByAccountId } = useChats();

  const createAndNavigateToChat = useMutation({
    mutationFn: (accountId: string) => getOrCreateChatByAccountId(accountId),
    onError: (error) => {
      if (error instanceof HTTPError) {
        toast.showAlertForError(error);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      history.push(`/chats/${data.id}`);
      queryClient.invalidateQueries({
        queryKey: ChatKeys.chatSearch(),
      });
    },
  });

  if (!account) {
    return (
      <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
        <div>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='relative flex'>
              <div
                className='size-24 rounded-full bg-gray-400 ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onBlock = () => {
    if (account.relationship?.blocking) {
      dispatch(unblockAccount(account.id));
    } else {
      dispatch(openModal('CONFIRM', {
        icon: banIcon,
        heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
        message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />, // eslint-disable-line formatjs/no-literal-string-in-jsx
        confirm: intl.formatMessage(messages.blockConfirm),
        onConfirm: () => dispatch(blockAccount(account.id)),
        secondary: intl.formatMessage(messages.blockAndReport),
        onSecondary: () => {
          dispatch(blockAccount(account.id));
          dispatch(initReport(ReportableEntities.ACCOUNT, account));
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
      follow(account.id, { reblogs: false });
    } else {
      follow(account.id, { reblogs: true });
    }
  };

  const onEndorseToggle = () => {
    if (account.relationship?.endorsed) {
      dispatch(unpinAccount(account.id))
        .then(() => toast.success(intl.formatMessage(messages.userUnendorsed, { acct: account.acct })))
        .catch(() => { });
    } else {
      dispatch(pinAccount(account.id))
        .then(() => toast.success(intl.formatMessage(messages.userEndorsed, { acct: account.acct })))
        .catch(() => { });
    }
  };

  const onReport = () => {
    dispatch(initReport(ReportableEntities.ACCOUNT, account));
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
      icon: banIcon,
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

  const onModerate = () => {
    dispatch(openModal('ACCOUNT_MODERATION', { accountId: account.id }));
  };

  const onRemoveFromFollowers = () => {
    dispatch((_, getState) => {
      const unfollowModal = getSettings(getState()).get('unfollowModal');
      if (unfollowModal) {
        dispatch(openModal('CONFIRM', {
          message: <FormattedMessage id='confirmations.remove_from_followers.message' defaultMessage='Are you sure you want to remove {name} from your followers?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />, // eslint-disable-line formatjs/no-literal-string-in-jsx
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

  const handleCopy: React.EventHandler<React.MouseEvent> = (e) => {
    copy(account.url);
  };

  const handleCopyNpub: React.EventHandler<React.MouseEvent> = (e) => {
    copy(nip19.npubEncode(account.nostr.pubkey!));
  };

  const handleZapAccount: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(openModal('ZAP_PAY_REQUEST', { account }));
  };

  const makeMenu = () => {
    const menu: Menu = [];

    if (!account) {
      return [];
    }

    if (features.rssFeeds && account.local) {
      menu.push({
        text: intl.formatMessage(messages.subscribeFeed),
        icon: rssIcon,
        href: software === MASTODON ? `${account.url}.rss` : `${account.url}/feed.rss`,
        target: '_blank',
      });
    }

    if ('share' in navigator) {
      menu.push({
        text: intl.formatMessage(messages.share, { name: account.username }),
        action: handleShare,
        icon: uploadIcon,
      });
    }

    const externalNostrUrl = account.ditto.external_url ? new URL(account.ditto.external_url).host : undefined;
    if (features.federating && (!account.local || externalNostrUrl)) {
      const domain = externalNostrUrl || account.fqn.split('@')[1];
      const url = account.ditto.external_url || account.url;

      if (domain && url) {
        menu.push({
          text: intl.formatMessage(messages.profileExternal, { domain }),
          action: () => onProfileExternal(url),
          icon: externalLinkIcon,
          href: url,
        });
      }
    }

    menu.push({
      text: intl.formatMessage(messages.copy),
      action: handleCopy,
      icon: clipboardCopyIcon,
    });

    if (account.nostr.pubkey) {
      menu.push({
        text: intl.formatMessage(messages.npub),
        action: handleCopyNpub,
        icon: clipboardCopyIcon,
      });
    }

    if (!ownAccount) return menu;

    if (features.searchFromAccount) {
      menu.push({
        text: intl.formatMessage(account.id === ownAccount.id ? messages.searchSelf : messages.search, { name: account.username }),
        action: onSearch,
        icon: searchIcon,
      });
    }

    if (menu.length) {
      menu.push(null);
    }

    if (account.id === ownAccount.id) {
      menu.push({
        text: intl.formatMessage(messages.edit_profile),
        to: '/settings/profile',
        icon: userIcon,
      });
      menu.push({
        text: intl.formatMessage(messages.preferences),
        to: '/settings',
        icon: settingsIcon,
      });
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mutes),
        to: '/mutes',
        icon: circleXIcon,
      });
      if (features.blocks) {
        menu.push({
          text: intl.formatMessage(messages.blocks),
          to: '/blocks',
          icon: banIcon,
        });
      }
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: account.username }),
        action: onMention,
        icon: atIcon,
      });

      if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: account.username }),
          action: onDirect,
          icon: mailIcon,
        });
      }

      if (account.relationship?.following) {
        if (account.relationship?.showing_reblogs) {
          menu.push({
            text: intl.formatMessage(messages.hideReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: repeatIcon,
          });
        } else {
          menu.push({
            text: intl.formatMessage(messages.showReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: repeatIcon,
          });
        }

        if (features.lists) {
          menu.push({
            text: intl.formatMessage(messages.add_or_remove_from_list),
            action: onAddToList,
            icon: listIcon,
          });
        }

        if (features.accountEndorsements) {
          menu.push({
            text: intl.formatMessage(account.relationship?.endorsed ? messages.unendorse : messages.endorse),
            action: onEndorseToggle,
            icon: userCheckIcon,
          });
        }
      } else if (features.lists && features.unrestrictedLists) {
        menu.push({
          text: intl.formatMessage(messages.add_or_remove_from_list),
          action: onAddToList,
          icon: listIcon,
        });
      }

      menu.push(null);

      if (features.removeFromFollowers && account.relationship?.followed_by) {
        menu.push({
          text: intl.formatMessage(messages.removeFromFollowers),
          action: onRemoveFromFollowers,
          icon: userXIcon,
        });
      }

      if (account.relationship?.muting) {
        menu.push({
          text: intl.formatMessage(messages.unmute, { name: account.username }),
          action: onMute,
          icon: circleXIcon,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.mute, { name: account.username }),
          action: onMute,
          icon: circleXIcon,
        });
      }

      if (features.blocks) {
        if (account.relationship?.blocking) {
          menu.push({
            text: intl.formatMessage(messages.unblock, { name: account.username }),
            action: onBlock,
            icon: banIcon,
          });
        } else {
          menu.push({
            text: intl.formatMessage(messages.block, { name: account.username }),
            action: onBlock,
            icon: banIcon,
          });
        }
      }

      menu.push({
        text: intl.formatMessage(messages.report, { name: account.username }),
        action: onReport,
        icon: flagIcon,
      });
    }

    if (!account.local && features.domainBlocks) {
      const domain = account.fqn.split('@')[1];

      menu.push(null);

      if (account.relationship?.domain_blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblockDomain, { domain }),
          action: () => onUnblockDomain(domain),
          icon: banIcon,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.blockDomain, { domain }),
          action: () => onBlockDomain(domain),
          icon: banIcon,
        });
      }
    }

    if (ownAccount.staff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        action: onModerate,
        icon: gavelIcon,
      });
    }

    return menu;
  };

  const makeInfo = () => {
    const info: React.ReactNode[] = [];

    if (!account || !ownAccount) return info;

    if (ownAccount.id !== account.id && account.relationship?.followed_by) {
      info.push(
        <Badge
          key='followed_by'
          slug='opaque'
          title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
        />,
      );
    } else if (ownAccount.id !== account.id && account.relationship?.blocking) {
      info.push(
        <Badge
          key='blocked'
          slug='opaque'
          title={<FormattedMessage id='account.blocked' defaultMessage='Blocked' />}
        />,
      );
    }

    if (ownAccount.id !== account.id && account.relationship?.muting) {
      info.push(
        <Badge
          key='muted'
          slug='opaque'
          title={<FormattedMessage id='account.muted' defaultMessage='Muted' />}
        />,
      );
    } else if (ownAccount.id !== account.id && account.relationship?.domain_blocking) {
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

  const renderHeader = () => {
    let header: React.ReactNode;

    if (account.header) {
      header = (
        <StillImage
          src={account.header}
          alt={intl.formatMessage(messages.header)}
        />
      );

      if (!isDefaultHeader(account.header)) {
        header = (
          <a href={account.header} onClick={handleHeaderClick} target='_blank'>
            {header}
          </a>
        );
      }
    }

    return header;
  };

  const renderMessageButton = () => {
    if (!ownAccount || !account || account.id === ownAccount?.id) {
      return null;
    }

    if (features.chatsWithFollowers) { // Truth Social
      const canChat = account.relationship?.followed_by;
      if (!canChat) {
        return null;
      }

      return (
        <IconButton
          src={messagesIcon}
          onClick={() => createAndNavigateToChat.mutate(account.id)}
          title={intl.formatMessage(messages.chat, { name: account.username })}
          theme='outlined'
          className='px-2'
          iconClassName='h-4 w-4'
          disabled={createAndNavigateToChat.isPending}
        />
      );
    } else if (account.pleroma?.accepts_chat_messages) {
      return (
        <IconButton
          src={messagesIcon}
          onClick={() => createAndNavigateToChat.mutate(account.id)}
          title={intl.formatMessage(messages.chat, { name: account.username })}
          theme='outlined'
          className='px-2'
          iconClassName='h-4 w-4'
        />
      );
    } else {
      return null;
    }
  };

  const renderShareButton = () => {
    const canShare = 'share' in navigator;

    if (!(account && ownAccount?.id && account.id === ownAccount?.id && canShare)) {
      return null;
    }

    return (
      <IconButton
        src={uploadIcon}
        onClick={handleShare}
        title={intl.formatMessage(messages.share, { name: account.username })}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  };

  const renderZapAccount = () => {
    return (
      <IconButton
        src={boltIcon}
        onClick={handleZapAccount}
        title={intl.formatMessage(messages.zap, { target: account.display_name })}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  };

  const info = makeInfo();
  const menu = makeMenu();
  const acceptsZaps = account.ditto.accepts_zaps === true;

  return (
    <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
      {(account.moved && typeof account.moved === 'object') && (
        <MovedNote from={account} to={account.moved as Account} />
      )}

      <div>
        <div className='relative isolate flex h-32 w-full flex-col justify-center overflow-hidden bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48'>
          {renderHeader()}

          <div className='absolute left-2 top-2'>
            <HStack alignItems='center' space={1}>
              {info}
            </HStack>
          </div>
        </div>
      </div>

      <div className='px-4 sm:px-6'>
        <HStack className='-mt-12' alignItems='bottom' space={5}>
          <div className='relative flex'>
            <a href={account.avatar} onClick={handleAvatarClick} target='_blank'>
              <Avatar
                src={account.avatar}
                size={96}
                className='relative size-24 rounded-full bg-white ring-4 ring-white dark:bg-primary-900 dark:ring-primary-900'
              />
            </a>
            {account.verified && (
              <div className='absolute bottom-0 right-0'>
                <VerificationBadge className='size-6 rounded-full bg-white ring-2 ring-white dark:bg-primary-900 dark:ring-primary-900' />
              </div>
            )}
          </div>

          <div className='mt-6 flex w-full justify-end sm:pb-1'>
            <HStack space={2} className='mt-10'>
              <SubscriptionButton account={account} />
              {renderMessageButton()}
              {renderShareButton()}
              {acceptsZaps && renderZapAccount()}

              {menu.length > 0 && (
                <DropdownMenu items={menu} placement='bottom-end'>
                  <IconButton
                    src={dotsIcon}
                    theme='outlined'
                    className='px-2'
                    iconClassName='h-4 w-4'
                    children={null}
                  />
                </DropdownMenu>
              )}

              <ActionButton account={account} />
            </HStack>
          </div>
        </HStack>
      </div>
    </div>
  );
};

export default Header;
