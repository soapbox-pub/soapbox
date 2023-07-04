import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { blockAccount } from 'soapbox/actions/accounts';
import { launchChat } from 'soapbox/actions/chats';
import { directCompose, mentionCompose, quoteCompose, replyCompose } from 'soapbox/actions/compose';
import { editEvent } from 'soapbox/actions/events';
import { pinToGroup, toggleBookmark, toggleDislike, toggleFavourite, togglePin, toggleReblog, unpinFromGroup } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { deleteStatusModal, toggleStatusSensitivityModal } from 'soapbox/actions/moderation';
import { initMuteModal } from 'soapbox/actions/mutes';
import { initReport, ReportableEntities } from 'soapbox/actions/reports';
import { deleteStatus, editStatus, toggleMuteStatus } from 'soapbox/actions/statuses';
import { deleteFromTimelines } from 'soapbox/actions/timelines';
import { useBlockGroupMember, useGroup, useGroupRelationship, useMuteGroup, useUnmuteGroup } from 'soapbox/api/hooks';
import { useDeleteGroupStatus } from 'soapbox/api/hooks/groups/useDeleteGroupStatus';
import DropdownMenu from 'soapbox/components/dropdown-menu';
import StatusActionButton from 'soapbox/components/status-action-button';
import StatusReactionWrapper from 'soapbox/components/status-reaction-wrapper';
import { HStack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures, useOwnAccount, useSettings, useSoapboxConfig } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';
import { isLocal, isRemote } from 'soapbox/utils/accounts';
import copy from 'soapbox/utils/copy';
import { getReactForStatus, reduceEmoji } from 'soapbox/utils/emoji-reacts';

import GroupPopover from './groups/popover/group-popover';

import type { Menu } from 'soapbox/components/dropdown-menu';
import type { Account, Group, Status } from 'soapbox/types/entities';

const messages = defineMessages({
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: '@{name} is banned' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  cannot_reblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be reposted' },
  chat: { id: 'status.chat', defaultMessage: 'Chat with @{name}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  deactivateUser: { id: 'admin.users.actions.deactivate_user', defaultMessage: 'Deactivate @{name}' },
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteFromGroupMessage: { id: 'confirmations.delete_from_group.message', defaultMessage: 'Are you sure you want to delete @{name}\'s post?' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
  deleteUser: { id: 'admin.users.actions.delete_user', defaultMessage: 'Delete @{name}' },
  direct: { id: 'status.direct', defaultMessage: 'Direct message @{name}' },
  disfavourite: { id: 'status.disfavourite', defaultMessage: 'Disike' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  embed: { id: 'status.embed', defaultMessage: 'Embed' },
  external: { id: 'status.external', defaultMessage: 'View post on {domain}' },
  favourite: { id: 'status.favourite', defaultMessage: 'Like' },
  groupBlockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Ban' },
  groupBlockFromGroupHeading: { id: 'confirmations.block_from_group.heading', defaultMessage: 'Ban From Group' },
  groupBlockFromGroupMessage: { id: 'confirmations.block_from_group.message', defaultMessage: 'Are you sure you want to ban @{name} from the group?' },
  groupModDelete: { id: 'status.group_mod_delete', defaultMessage: 'Delete post from group' },
  group_remove_account: { id: 'status.remove_account_from_group', defaultMessage: 'Remove account from group' },
  group_remove_post: { id: 'status.remove_post_from_group', defaultMessage: 'Remove post from group' },
  markStatusNotSensitive: { id: 'admin.statuses.actions.mark_status_not_sensitive', defaultMessage: 'Mark post not sensitive' },
  markStatusSensitive: { id: 'admin.statuses.actions.mark_status_sensitive', defaultMessage: 'Mark post sensitive' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  more: { id: 'status.more', defaultMessage: 'More' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  muteConfirm: { id: 'confirmations.mute_group.confirm', defaultMessage: 'Mute' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  muteGroup: { id: 'group.mute.long_label', defaultMessage: 'Mute Group' },
  muteHeading: { id: 'confirmations.mute_group.heading', defaultMessage: 'Mute Group' },
  muteMessage: { id: 'confirmations.mute_group.message', defaultMessage: 'You are about to mute the group. Do you want to continue?' },
  muteSuccess: { id: 'group.mute.success', defaultMessage: 'Muted the group' },
  open: { id: 'status.open', defaultMessage: 'Expand this post' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  pinToGroup: { id: 'status.pin_to_group', defaultMessage: 'Pin to Group' },
  pinToGroupSuccess: { id: 'status.pin_to_group.success', defaultMessage: 'Pinned to Group!' },
  quotePost: { id: 'status.quote', defaultMessage: 'Quote post' },
  reactionCry: { id: 'status.reactions.cry', defaultMessage: 'Sad' },
  reactionHeart: { id: 'status.reactions.heart', defaultMessage: 'Love' },
  reactionLaughing: { id: 'status.reactions.laughing', defaultMessage: 'Haha' },
  reactionLike: { id: 'status.reactions.like', defaultMessage: 'Like' },
  reactionOpenMouth: { id: 'status.reactions.open_mouth', defaultMessage: 'Wow' },
  reactionWeary: { id: 'status.reactions.weary', defaultMessage: 'Weary' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
  reblog_private: { id: 'status.reblog_private', defaultMessage: 'Repost to original audience' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this post and re-draft it? Favorites and reposts will be lost, and replies to the original post will be orphaned.' },
  replies_disabled_group: { id: 'status.disabled_replies.group_membership', defaultMessage: 'Only group members can reply' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  unmuteGroup: { id: 'group.unmute.long_label', defaultMessage: 'Unmute Group' },
  unmuteSuccess: { id: 'group.unmute.success', defaultMessage: 'Unmuted the group' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  unpinFromGroup: { id: 'status.unpin_to_group', defaultMessage: 'Unpin from Group' },
});

interface IStatusActionBar {
  status: Status
  withLabels?: boolean
  expandable?: boolean
  space?: 'sm' | 'md' | 'lg'
  statusActionButtonTheme?: 'default' | 'inverse'
}

const StatusActionBar: React.FC<IStatusActionBar> = ({
  status,
  withLabels = false,
  expandable = true,
  space = 'sm',
  statusActionButtonTheme = 'default',
}) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const match = useRouteMatch<{ groupSlug: string }>('/group/:groupSlug');

  const { group } = useGroup((status.group as Group)?.id as string);
  const muteGroup = useMuteGroup(group as Group);
  const unmuteGroup = useUnmuteGroup(group as Group);
  const isMutingGroup = !!group?.relationship?.muting;
  const deleteGroupStatus = useDeleteGroupStatus(group as Group, status.id);
  const blockGroupMember = useBlockGroupMember(group as Group, status?.account as any);

  const me = useAppSelector(state => state.me);
  const { groupRelationship } = useGroupRelationship(status.group?.id);
  const features = useFeatures();
  const settings = useSettings();
  const soapboxConfig = useSoapboxConfig();

  const { allowedEmoji } = soapboxConfig;

  const { account } = useOwnAccount();
  const isStaff = account ? account.staff : false;
  const isAdmin = account ? account.admin : false;

  if (!status) {
    return null;
  }

  const onOpenUnauthorizedModal = (action?: string) => {
    dispatch(openModal('UNAUTHORIZED', {
      action,
      ap_id: status.url,
    }));
  };

  const handleReplyClick: React.MouseEventHandler = (e) => {
    if (me) {
      dispatch(replyCompose(status));
    } else {
      onOpenUnauthorizedModal('REPLY');
    }
  };

  const handleShareClick = () => {
    navigator.share({
      text: status.search_index,
      url: status.uri,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  const handleFavouriteClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      dispatch(toggleFavourite(status));
    } else {
      onOpenUnauthorizedModal('FAVOURITE');
    }
  };

  const handleDislikeClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      dispatch(toggleDislike(status));
    } else {
      onOpenUnauthorizedModal('DISLIKE');
    }
  };

  const handleBookmarkClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(toggleBookmark(status));
  };

  const handleExternalClick = () => {
    window.open(status.uri, '_blank');
  };

  const handleReblogClick: React.EventHandler<React.MouseEvent> = e => {
    if (me) {
      const modalReblog = () => dispatch(toggleReblog(status));
      const boostModal = settings.get('boostModal');
      if ((e && e.shiftKey) || !boostModal) {
        modalReblog();
      } else {
        dispatch(openModal('BOOST', { status, onReblog: modalReblog }));
      }
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const handleQuoteClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      dispatch(quoteCompose(status));
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const doDeleteStatus = (withRedraft = false) => {
    dispatch((_, getState) => {
      const deleteModal = settings.get('deleteModal');
      if (!deleteModal) {
        dispatch(deleteStatus(status.id, withRedraft));
      } else {
        dispatch(openModal('CONFIRM', {
          icon: withRedraft ? require('@tabler/icons/edit.svg') : require('@tabler/icons/trash.svg'),
          heading: intl.formatMessage(withRedraft ? messages.redraftHeading : messages.deleteHeading),
          message: intl.formatMessage(withRedraft ? messages.redraftMessage : messages.deleteMessage),
          confirm: intl.formatMessage(withRedraft ? messages.redraftConfirm : messages.deleteConfirm),
          onConfirm: () => dispatch(deleteStatus(status.id, withRedraft)),
        }));
      }
    });
  };

  const handleDeleteClick: React.EventHandler<React.MouseEvent> = (e) => {
    doDeleteStatus();
  };

  const handleRedraftClick: React.EventHandler<React.MouseEvent> = (e) => {
    doDeleteStatus(true);
  };

  const handleEditClick: React.EventHandler<React.MouseEvent> = () => {
    if (status.event) dispatch(editEvent(status.id));
    else dispatch(editStatus(status.id));
  };

  const handlePinClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(togglePin(status));
  };

  const handleGroupPinClick: React.EventHandler<React.MouseEvent> = () => {
    const group = status.group as Group;

    if (status.pinned) {
      dispatch(unpinFromGroup(status, group));
    } else {
      dispatch(pinToGroup(status, group))
        .then(() => toast.success(intl.formatMessage(messages.pinToGroupSuccess)))
        .catch(() => null);
    }
  };

  const handleMentionClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(mentionCompose(status.account as Account));
  };

  const handleDirectClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(directCompose(status.account as Account));
  };

  const handleChatClick: React.EventHandler<React.MouseEvent> = (e) => {
    const account = status.account as Account;
    dispatch(launchChat(account.id, history));
  };

  const handleMuteClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(initMuteModal(status.account as Account));
  };

  const handleMuteGroupClick: React.EventHandler<React.MouseEvent> = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.muteHeading),
      message: intl.formatMessage(messages.muteMessage),
      confirm: intl.formatMessage(messages.muteConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => muteGroup.mutate(undefined, {
        onSuccess() {
          toast.success(intl.formatMessage(messages.muteSuccess));
        },
      }),
    }));

  const handleUnmuteGroupClick: React.EventHandler<React.MouseEvent> = () => {
    unmuteGroup.mutate(undefined, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.unmuteSuccess));
      },
    });
  };

  const handleBlockClick: React.EventHandler<React.MouseEvent> = (e) => {
    const account = status.account as Account;

    dispatch(openModal('CONFIRM', {
      icon: require('@tabler/icons/ban.svg'),
      heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.id)),
      secondary: intl.formatMessage(messages.blockAndReport),
      onSecondary: () => {
        dispatch(blockAccount(account.id));
        dispatch(initReport(ReportableEntities.STATUS, account, { status }));
      },
    }));
  };

  const handleOpen: React.EventHandler<React.MouseEvent> = (e) => {
    history.push(`/@${status.account.acct}/posts/${status.id}`);
  };

  const handleEmbed = () => {
    dispatch(openModal('EMBED', {
      url: status.url,
      onError: (error: any) => toast.showAlertForError(error),
    }));
  };

  const handleReport: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(initReport(ReportableEntities.STATUS, status.account as Account, { status }));
  };

  const handleConversationMuteClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(toggleMuteStatus(status));
  };

  const handleCopy: React.EventHandler<React.MouseEvent> = (e) => {
    const { uri } = status;

    copy(uri);
  };

  const onModerate: React.MouseEventHandler = (e) => {
    const account = status.account as Account;
    dispatch(openModal('ACCOUNT_MODERATION', { accountId: account.id }));
  };

  const handleDeleteStatus: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const handleToggleStatusSensitivity: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(toggleStatusSensitivityModal(intl, status.id, status.sensitive));
  };

  const handleDeleteFromGroup: React.EventHandler<React.MouseEvent> = () => {
    const account = status.account as Account;

    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteFromGroupMessage, { name: <strong className='break-words'>{account.username}</strong> }),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteGroupStatus.mutate(status.id, {
          onSuccess() {
            dispatch(deleteFromTimelines(status.id));
          },
        });
      },
    }));
  };

  const handleBlockFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.groupBlockFromGroupHeading),
      message: intl.formatMessage(messages.groupBlockFromGroupMessage, { name: (status.account as any).username }),
      confirm: intl.formatMessage(messages.groupBlockConfirm),
      onConfirm: () => {
        blockGroupMember({ account_ids: [(status.account as any).id] }, {
          onSuccess() {
            toast.success(intl.formatMessage(messages.blocked, { name: account?.acct }));
          },
        });
      },
    }));
  };

  const _makeMenu = (publicStatus: boolean) => {
    const mutingConversation = status.muted;
    const ownAccount = status.account.id === me;
    const username = status.account.username;
    const account = status.account;
    const domain = account.fqn.split('@')[1];

    const menu: Menu = [];

    if (expandable) {
      menu.push({
        text: intl.formatMessage(messages.open),
        action: handleOpen,
        icon: require('@tabler/icons/arrows-vertical.svg'),
      });
    }

    if (publicStatus) {
      menu.push({
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: require('@tabler/icons/clipboard-copy.svg'),
      });

      if (features.embeds && isLocal(account)) {
        menu.push({
          text: intl.formatMessage(messages.embed),
          action: handleEmbed,
          icon: require('@tabler/icons/share.svg'),
        });
      }
    }

    if (!me) {
      return menu;
    }

    const isGroupStatus = typeof status.group === 'object';
    if (isGroupStatus && !!status.group) {
      const isGroupOwner = groupRelationship?.role === GroupRoles.OWNER;

      if (isGroupOwner) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpinFromGroup : messages.pinToGroup),
          action: handleGroupPinClick,
          icon: status.pinned ? require('@tabler/icons/pinned-off.svg') : require('@tabler/icons/pin.svg'),
        });
      }
    }

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? require('@tabler/icons/bookmark-off.svg') : require('@tabler/icons/bookmark.svg'),
      });
    }

    if (features.federating && isRemote(account)) {
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        action: handleExternalClick,
        icon: require('@tabler/icons/external-link.svg'),
      });
    }

    menu.push(null);

    menu.push({
      text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation),
      action: handleConversationMuteClick,
      icon: mutingConversation ? require('@tabler/icons/bell.svg') : require('@tabler/icons/bell-off.svg'),
    });

    menu.push(null);

    if (ownAccount) {
      if (publicStatus) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? require('@tabler/icons/pinned-off.svg') : require('@tabler/icons/pin.svg'),
        });
      } else {
        if (status.visibility === 'private') {
          menu.push({
            text: intl.formatMessage(status.reblogged ? messages.cancel_reblog_private : messages.reblog_private),
            action: handleReblogClick,
            icon: require('@tabler/icons/repeat.svg'),
          });
        }
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: require('@tabler/icons/trash.svg'),
        destructive: true,
      });
      if (features.editStatuses) {
        menu.push({
          text: intl.formatMessage(messages.edit),
          action: handleEditClick,
          icon: require('@tabler/icons/edit.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.redraft),
          action: handleRedraftClick,
          icon: require('@tabler/icons/edit.svg'),
          destructive: true,
        });
      }
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: require('@tabler/icons/at.svg'),
      });

      if (status.account.pleroma?.accepts_chat_messages === true) {
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
      if (features.groupsMuting && status.group) {
        menu.push({
          text: isMutingGroup ? intl.formatMessage(messages.unmuteGroup) : intl.formatMessage(messages.muteGroup),
          icon: require('@tabler/icons/volume-3.svg'),
          action: isMutingGroup ? handleUnmuteGroupClick : handleMuteGroupClick,
        });
        menu.push(null);
      }

      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: require('@tabler/icons/volume-3.svg'),
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

    if (isGroupStatus && !!status.group) {
      const group = status.group as Group;
      const account = status.account as Account;
      const isGroupOwner = groupRelationship?.role === GroupRoles.OWNER;
      const isGroupAdmin = groupRelationship?.role === GroupRoles.ADMIN;
      const isStatusFromOwner = group.owner.id === account.id;

      const canBanUser = match?.isExact && (isGroupOwner || isGroupAdmin) && !isStatusFromOwner && !ownAccount;
      const canDeleteStatus = !ownAccount && (isGroupOwner || (isGroupAdmin && !isStatusFromOwner));

      if (canBanUser || canDeleteStatus) {
        menu.push(null);
      }

      if (canBanUser) {
        menu.push({
          text: 'Ban from Group',
          action: handleBlockFromGroup,
          icon: require('@tabler/icons/ban.svg'),
          destructive: true,
        });
      }

      if (canDeleteStatus) {
        menu.push({
          text: intl.formatMessage(messages.groupModDelete),
          action: handleDeleteFromGroup,
          icon: require('@tabler/icons/trash.svg'),
          destructive: true,
        });
      }
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: username }),
        action: onModerate,
        icon: require('@tabler/icons/gavel.svg'),
      });

      if (isAdmin) {
        menu.push({
          text: intl.formatMessage(messages.admin_status),
          href: `/pleroma/admin/#/statuses/${status.id}/`,
          icon: require('@tabler/icons/pencil.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(status.sensitive === false ? messages.markStatusSensitive : messages.markStatusNotSensitive),
        action: handleToggleStatusSensitivity,
        icon: require('@tabler/icons/alert-triangle.svg'),
      });

      if (!ownAccount) {
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

  const publicStatus = ['public', 'unlisted', 'group'].includes(status.visibility);

  const replyCount = status.replies_count;
  const reblogCount = status.reblogs_count;
  const favouriteCount = status.favourites_count;

  const emojiReactCount = reduceEmoji(
    (status.pleroma.get('emoji_reactions') || ImmutableList()) as ImmutableList<any>,
    favouriteCount,
    status.favourited,
    allowedEmoji,
  ).reduce((acc, cur) => acc + cur.get('count'), 0);

  const meEmojiReact = getReactForStatus(status, allowedEmoji);
  const meEmojiName = meEmojiReact?.get('name') as keyof typeof reactMessages | undefined;

  const reactMessages = {
    '👍': messages.reactionLike,
    '❤️': messages.reactionHeart,
    '😆': messages.reactionLaughing,
    '😮': messages.reactionOpenMouth,
    '😢': messages.reactionCry,
    '😩': messages.reactionWeary,
    '': messages.favourite,
  };

  const meEmojiTitle = intl.formatMessage(reactMessages[meEmojiName || ''] || messages.favourite);

  const menu = _makeMenu(publicStatus);
  let reblogIcon = require('@tabler/icons/repeat.svg');
  let replyTitle;
  let replyDisabled = false;

  if (status.visibility === 'direct') {
    reblogIcon = require('@tabler/icons/mail.svg');
  } else if (status.visibility === 'private') {
    reblogIcon = require('@tabler/icons/lock.svg');
  }

  if ((status.group as Group)?.membership_required && !groupRelationship?.member) {
    replyDisabled = true;
    replyTitle = intl.formatMessage(messages.replies_disabled_group);
  }

  const reblogMenu = [{
    text: intl.formatMessage(status.reblogged ? messages.cancel_reblog_private : messages.reblog),
    action: handleReblogClick,
    icon: require('@tabler/icons/repeat.svg'),
  }, {
    text: intl.formatMessage(messages.quotePost),
    action: handleQuoteClick,
    icon: require('@tabler/icons/quote.svg'),
  }];

  const reblogButton = (
    <StatusActionButton
      icon={reblogIcon}
      color='success'
      disabled={!publicStatus}
      title={!publicStatus ? intl.formatMessage(messages.cannot_reblog) : intl.formatMessage(messages.reblog)}
      active={status.reblogged}
      onClick={handleReblogClick}
      count={reblogCount}
      text={withLabels ? intl.formatMessage(messages.reblog) : undefined}
      theme={statusActionButtonTheme}
    />
  );

  if (!status.in_reply_to_id) {
    replyTitle = intl.formatMessage(messages.reply);
  } else {
    replyTitle = intl.formatMessage(messages.replyAll);
  }

  const canShare = ('share' in navigator) && (status.visibility === 'public' || status.visibility === 'group');

  const spacing: {
    [key: string]: React.ComponentProps<typeof HStack>['space']
  } = {
    'sm': 2,
    'md': 8,
    'lg': 0, // using justifyContent instead on the HStack
  };

  return (
    <HStack data-testid='status-action-bar'>
      <HStack
        justifyContent={space === 'lg' ? 'between' : undefined}
        space={spacing[space]}
        grow={space === 'lg'}
        onClick={e => e.stopPropagation()}
        alignItems='center'
      >
        <GroupPopover
          group={status.group as any}
          isEnabled={replyDisabled}
        >
          <StatusActionButton
            title={replyTitle}
            icon={require('@tabler/icons/message-circle-2.svg')}
            onClick={handleReplyClick}
            count={replyCount}
            text={withLabels ? intl.formatMessage(messages.reply) : undefined}
            disabled={replyDisabled}
            theme={statusActionButtonTheme}
          />
        </GroupPopover>

        {(features.quotePosts && me) ? (
          <DropdownMenu
            items={reblogMenu}
            disabled={!publicStatus}
            onShiftClick={handleReblogClick}
          >
            {reblogButton}
          </DropdownMenu>
        ) : (
          reblogButton
        )}

        {features.emojiReacts ? (
          <StatusReactionWrapper statusId={status.id}>
            <StatusActionButton
              title={meEmojiTitle}
              icon={require('@tabler/icons/heart.svg')}
              filled
              color='accent'
              active={Boolean(meEmojiName)}
              count={emojiReactCount}
              emoji={meEmojiReact}
              text={withLabels ? meEmojiTitle : undefined}
              theme={statusActionButtonTheme}
            />
          </StatusReactionWrapper>
        ) : (
          <StatusActionButton
            title={intl.formatMessage(messages.favourite)}
            icon={features.dislikes ? require('@tabler/icons/thumb-up.svg') : require('@tabler/icons/heart.svg')}
            color='accent'
            filled
            onClick={handleFavouriteClick}
            active={Boolean(meEmojiName)}
            count={favouriteCount}
            text={withLabels ? meEmojiTitle : undefined}
            theme={statusActionButtonTheme}
          />
        )}

        {features.dislikes && (
          <StatusActionButton
            title={intl.formatMessage(messages.disfavourite)}
            icon={require('@tabler/icons/thumb-down.svg')}
            color='accent'
            filled
            onClick={handleDislikeClick}
            active={status.disliked}
            count={status.dislikes_count}
            text={withLabels ? intl.formatMessage(messages.disfavourite) : undefined}
            theme={statusActionButtonTheme}
          />
        )}

        {canShare && (
          <StatusActionButton
            title={intl.formatMessage(messages.share)}
            icon={require('@tabler/icons/upload.svg')}
            onClick={handleShareClick}
            theme={statusActionButtonTheme}
          />
        )}

        <DropdownMenu items={menu} status={status}>
          <StatusActionButton
            title={intl.formatMessage(messages.more)}
            icon={require('@tabler/icons/dots.svg')}
            theme={statusActionButtonTheme}
          />
        </DropdownMenu>
      </HStack>
    </HStack>
  );
};

export default StatusActionBar;
