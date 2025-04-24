import alertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg';
import arrowsVerticalIcon from '@tabler/icons/outline/arrows-vertical.svg';
import atIcon from '@tabler/icons/outline/at.svg';
import banIcon from '@tabler/icons/outline/ban.svg';
import bellOffIcon from '@tabler/icons/outline/bell-off.svg';
import bellIcon from '@tabler/icons/outline/bell.svg';
import boltIcon from '@tabler/icons/outline/bolt.svg';
import bookmarkOffIcon from '@tabler/icons/outline/bookmark-off.svg';
import bookmarkIcon from '@tabler/icons/outline/bookmark.svg';
import clipboardCopyIcon from '@tabler/icons/outline/clipboard-copy.svg';
import dotsIcon from '@tabler/icons/outline/dots.svg';
import editIcon from '@tabler/icons/outline/edit.svg';
import externalLinkIcon from '@tabler/icons/outline/external-link.svg';
import flagIcon from '@tabler/icons/outline/flag.svg';
import gavelIcon from '@tabler/icons/outline/gavel.svg';
import heartIcon from '@tabler/icons/outline/heart.svg';
import lockIcon from '@tabler/icons/outline/lock.svg';
import mailIcon from '@tabler/icons/outline/mail.svg';
import messageCircleIcon from '@tabler/icons/outline/message-circle.svg';
import messagesIcon from '@tabler/icons/outline/messages.svg';
import pencilIcon from '@tabler/icons/outline/pencil.svg';
import pinIcon from '@tabler/icons/outline/pin.svg';
import pinnedOffIcon from '@tabler/icons/outline/pinned-off.svg';
import quoteIcon from '@tabler/icons/outline/quote.svg';
import repeatIcon from '@tabler/icons/outline/repeat.svg';
import shareIcon from '@tabler/icons/outline/share.svg';
import thumbDownIcon from '@tabler/icons/outline/thumb-down.svg';
import thumbUpIcon from '@tabler/icons/outline/thumb-up.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import uploadIcon from '@tabler/icons/outline/upload.svg';
import volume3Icon from '@tabler/icons/outline/volume-3.svg';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { blockAccount } from 'soapbox/actions/accounts.ts';
import { launchChat } from 'soapbox/actions/chats.ts';
import { directCompose, mentionCompose, quoteCompose, replyCompose } from 'soapbox/actions/compose.ts';
import { editEvent } from 'soapbox/actions/events.ts';
import { pinToGroup, toggleDislike, toggleFavourite, togglePin, unpinFromGroup } from 'soapbox/actions/interactions.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { deleteStatusModal, toggleStatusSensitivityModal } from 'soapbox/actions/moderation.tsx';
import { initMuteModal } from 'soapbox/actions/mutes.ts';
import { initReport, ReportableEntities } from 'soapbox/actions/reports.ts';
import { deleteStatus, editStatus, toggleMuteStatus } from 'soapbox/actions/statuses.ts';
import { deleteFromTimelines } from 'soapbox/actions/timelines.ts';
import { useDeleteGroupStatus } from 'soapbox/api/hooks/groups/useDeleteGroupStatus.ts';
import { useBlockGroupMember, useBookmark, useGroup, useGroupRelationship, useMuteGroup, useUnmuteGroup } from 'soapbox/api/hooks/index.ts';
import DropdownMenu from 'soapbox/components/dropdown-menu/index.ts';
import StatusActionButton from 'soapbox/components/status-action-button.tsx';
import StatusReactionWrapper from 'soapbox/components/status-reaction-wrapper.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useReblog } from 'soapbox/hooks/useReblog.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { GroupRoles } from 'soapbox/schemas/group-member.ts';
import { Status as StatusEntity } from 'soapbox/schemas/index.ts';
import toast from 'soapbox/toast.tsx';
import copy from 'soapbox/utils/copy.ts';

import GroupPopover from './groups/popover/group-popover.tsx';

import type { Menu } from 'soapbox/components/dropdown-menu/index.ts';
import type { Group, Status as LegacyStatus } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: '@{name} is banned' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  cannot_reblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be reposted' },
  chat: { id: 'status.chat', defaultMessage: 'Chat with @{name}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy Link to Post' },
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
  embed: { id: 'status.embed', defaultMessage: 'Embed post' },
  external: { id: 'status.external', defaultMessage: 'View post on {domain}' },
  favourite: { id: 'status.favourite', defaultMessage: 'Like' },
  groupBlockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Ban User' },
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
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute Conversation' },
  muteGroup: { id: 'group.mute.long_label', defaultMessage: 'Mute Group' },
  muteHeading: { id: 'confirmations.mute_group.heading', defaultMessage: 'Mute Group' },
  muteMessage: { id: 'confirmations.mute_group.message', defaultMessage: 'You are about to mute the group. Do you want to continue?' },
  muteSuccess: { id: 'group.mute.success', defaultMessage: 'Muted the group' },
  open: { id: 'status.open', defaultMessage: 'Show Post Details' },
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
  replyAll: { id: 'status.reply_all', defaultMessage: 'Reply to thread' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute Conversation' },
  unmuteGroup: { id: 'group.unmute.long_label', defaultMessage: 'Unmute Group' },
  unmuteSuccess: { id: 'group.unmute.success', defaultMessage: 'Unmuted the group' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  unpinFromGroup: { id: 'status.unpin_to_group', defaultMessage: 'Unpin from Group' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  zap: { id: 'status.zap', defaultMessage: 'Zap' },
});

interface IStatusActionBar {
  status: LegacyStatus;
  expandable?: boolean;
  space?: 'sm' | 'md' | 'lg';
  statusActionButtonTheme?: 'default' | 'inverse';
}

const StatusActionBar: React.FC<IStatusActionBar> = ({
  status,
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
  const blockGroupMember = useBlockGroupMember(group as Group, status.account);

  const me = useAppSelector(state => state.me);
  const { groupRelationship } = useGroupRelationship(status.group?.id);
  const features = useFeatures();
  const { boostModal, deleteModal } = useSettings();

  const { account } = useOwnAccount();
  const isStaff = account ? account.staff : false;
  const isAdmin = account ? account.admin : false;

  const { toggleReblog } = useReblog();
  const { bookmark, unbookmark } = useBookmark();

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

  const handleZapClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      dispatch(openModal('PAY_REQUEST', { status, account: status.account }));
    } else {
      onOpenUnauthorizedModal('PAY_REQUEST');
    }
  };

  const handleBookmarkClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (status.bookmarked) {
      unbookmark(status.id).then(({ success }) => {
        if (success) {
          toast.success(messages.bookmarkRemoved);
        }
      }).catch(null);
    } else {
      bookmark(status.id).then(({ success }) => {
        if (success) {
          toast.success(messages.bookmarkAdded, {
            actionLink: '/bookmarks/all', actionLabel: messages.view,
          });
        }
      }).catch(null);
    }
  };

  const handleReblogClick: React.EventHandler<React.MouseEvent> = e => {
    if (me) {
      const modalReblog = () => toggleReblog(status.id);
      if ((e && e.shiftKey) || !boostModal) {
        modalReblog();
      } else {
        dispatch(openModal('BOOST', { status: status.toJS(), onReblog: modalReblog }));
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
      if (!deleteModal) {
        dispatch(deleteStatus(status.id, withRedraft));
      } else {
        dispatch(openModal('CONFIRM', {
          icon: withRedraft ? editIcon : trashIcon,
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
    dispatch(mentionCompose(status.account));
  };

  const handleDirectClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(directCompose(status.account));
  };

  const handleChatClick: React.EventHandler<React.MouseEvent> = (e) => {
    const account = status.account;
    dispatch(launchChat(account.id, history));
  };

  const handleMuteClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(initMuteModal(status.account));
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
    const account = status.account;

    dispatch(openModal('CONFIRM', {
      icon: banIcon,
      heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />, // eslint-disable-line formatjs/no-literal-string-in-jsx
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.id)),
      secondary: intl.formatMessage(messages.blockAndReport),
      onSecondary: () => {
        dispatch(blockAccount(account.id));
        dispatch(initReport(ReportableEntities.STATUS, account, { status }));
      },
    }));
  };

  const handleEmbed = () => {
    dispatch(openModal('EMBED', {
      url: status.url,
      onError: (error: any) => toast.showAlertForError(error),
    }));
  };

  const handleReport: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(initReport(ReportableEntities.STATUS, status.account, { status }));
  };

  const handleConversationMuteClick: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(toggleMuteStatus(status.toJS() as StatusEntity));
  };

  const handleCopy: React.EventHandler<React.MouseEvent> = (e) => {
    const { uri } = status;

    copy(uri);
  };

  const onModerate: React.MouseEventHandler = (e) => {
    const account = status.account;
    dispatch(openModal('ACCOUNT_MODERATION', { accountId: account.id }));
  };

  const handleDeleteStatus: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const handleToggleStatusSensitivity: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(toggleStatusSensitivityModal(intl, status.id, status.sensitive));
  };

  const handleDeleteFromGroup: React.EventHandler<React.MouseEvent> = () => {
    const account = status.account;

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
      message: intl.formatMessage(messages.groupBlockFromGroupMessage, { name: status.account.username }),
      confirm: intl.formatMessage(messages.groupBlockConfirm),
      onConfirm: () => {
        blockGroupMember({ account_ids: [status.account.id] }, {
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

    const menu: Menu = [];

    if (expandable) {
      menu.push({
        text: intl.formatMessage(messages.open),
        icon: arrowsVerticalIcon,
        to: `/@${status.account.acct}/posts/${status.id}`,
      });
    }

    if (publicStatus) {
      menu.push({
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: clipboardCopyIcon,
      });

      if (features.embeds && account.local) {
        menu.push({
          text: intl.formatMessage(messages.embed),
          action: handleEmbed,
          icon: shareIcon,
        });
      }
    }

    if (features.federating && (status.ditto?.get('external_url') || !account.local)) {
      const externalNostrUrl: string | undefined = status.ditto?.get('external_url');
      const { hostname: domain } = new URL(externalNostrUrl || status.uri);

      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        icon: externalLinkIcon,
        href: externalNostrUrl || status.uri,
        target: '_blank',
      });
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
          icon: status.pinned ? pinnedOffIcon : pinIcon,
        });
      }
    }

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? bookmarkOffIcon : bookmarkIcon,
      });
    }

    menu.push(null);

    menu.push({
      text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation),
      action: handleConversationMuteClick,
      icon: mutingConversation ? bellIcon : bellOffIcon,
    });

    menu.push(null);

    if (ownAccount) {
      if (publicStatus) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? pinnedOffIcon : pinIcon,
        });
      } else {
        if (status.visibility === 'private') {
          menu.push({
            text: intl.formatMessage(status.reblogged ? messages.cancel_reblog_private : messages.reblog_private),
            action: handleReblogClick,
            icon: repeatIcon,
          });
        }
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: trashIcon,
        destructive: true,
      });
      if (features.editStatuses) {
        menu.push({
          text: intl.formatMessage(messages.edit),
          action: handleEditClick,
          icon: editIcon,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.redraft),
          action: handleRedraftClick,
          icon: editIcon,
          destructive: true,
        });
      }
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: atIcon,
      });

      if (status.account.pleroma?.accepts_chat_messages === true) {
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
      if (features.groupsMuting && status.group) {
        menu.push({
          text: isMutingGroup ? intl.formatMessage(messages.unmuteGroup) : intl.formatMessage(messages.muteGroup),
          icon: volume3Icon,
          action: isMutingGroup ? handleUnmuteGroupClick : handleMuteGroupClick,
        });
        menu.push(null);
      }

      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: volume3Icon,
      });
      if (features.blocks) {
        menu.push({
          text: intl.formatMessage(messages.block, { name: username }),
          action: handleBlockClick,
          icon: banIcon,
        });
      }
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: flagIcon,
      });
    }

    if (isGroupStatus && !!status.group) {
      const group = status.group as Group;
      const account = status.account;
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
          icon: banIcon,
          destructive: true,
        });
      }

      if (canDeleteStatus) {
        menu.push({
          text: intl.formatMessage(messages.groupModDelete),
          action: handleDeleteFromGroup,
          icon: trashIcon,
          destructive: true,
        });
      }
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: username }),
        action: onModerate,
        icon: gavelIcon,
      });

      if (isAdmin) {
        menu.push({
          text: intl.formatMessage(messages.admin_status),
          href: `/pleroma/admin/#/statuses/${status.id}/`,
          icon: pencilIcon,
        });
      }

      menu.push({
        text: intl.formatMessage(status.sensitive === false ? messages.markStatusSensitive : messages.markStatusNotSensitive),
        action: handleToggleStatusSensitivity,
        icon: alertTriangleIcon,
      });

      if (!ownAccount) {
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

  const publicStatus = ['public', 'unlisted', 'group'].includes(status.visibility);

  const replyCount = status.replies_count;
  const reblogCount = status.reblogs_count;
  const favouriteCount = status.favourites_count;

  const emojiReactCount = status.reactions?.reduce((acc, reaction) => acc + (reaction.count ?? 0), 0) ?? 0; // allow all emojis

  const meEmojiReact = status.reactions?.find((emojiReact) => emojiReact.me) // allow all emojis
  ?? (
    status.favourited && account
      ? { count: 1, me: status.account.id === account.id, name: '👍' }
      : undefined
  );

  const meEmojiName = meEmojiReact?.name as keyof typeof reactMessages | undefined;

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
  let reblogIcon = repeatIcon;
  let replyTitle;
  let replyDisabled = false;

  if (status.visibility === 'direct') {
    reblogIcon = mailIcon;
  } else if (status.visibility === 'private') {
    reblogIcon = lockIcon;
  }

  if ((status.group as Group)?.membership_required && !groupRelationship?.member) {
    replyDisabled = true;
    replyTitle = intl.formatMessage(messages.replies_disabled_group);
  }

  const reblogMenu = [{
    text: intl.formatMessage(status.reblogged ? messages.cancel_reblog_private : messages.reblog),
    action: handleReblogClick,
    icon: repeatIcon,
  }, {
    text: intl.formatMessage(messages.quotePost),
    action: handleQuoteClick,
    icon: quoteIcon,
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
      theme={statusActionButtonTheme}
    />
  );

  if (!status.in_reply_to_id) {
    replyTitle = intl.formatMessage(messages.reply);
  } else {
    replyTitle = intl.formatMessage(messages.replyAll);
  }

  const canShare = ('share' in navigator) && (status.visibility === 'public' || status.visibility === 'group');
  const acceptsZaps = status.account.ditto.accepts_zaps === true;
  const acceptsZapsCashu = status.account.ditto.accepts_zaps_cashu === true;

  const spacing: {
    [key: string]: React.ComponentProps<typeof HStack>['space'];
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
            icon={messageCircleIcon}
            onClick={handleReplyClick}
            count={replyCount}
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
              icon={heartIcon}
              filled
              color='accent'
              active={Boolean(meEmojiName)}
              count={emojiReactCount + favouriteCount}
              emoji={meEmojiReact}
              theme={statusActionButtonTheme}
            />
          </StatusReactionWrapper>
        ) : (
          <StatusActionButton
            title={intl.formatMessage(messages.favourite)}
            icon={features.dislikes ? thumbUpIcon : heartIcon}
            color='accent'
            filled
            onClick={handleFavouriteClick}
            active={Boolean(meEmojiName)}
            count={favouriteCount}
            theme={statusActionButtonTheme}
          />
        )}

        {features.dislikes && (
          <StatusActionButton
            title={intl.formatMessage(messages.disfavourite)}
            icon={thumbDownIcon}
            color='accent'
            filled
            onClick={handleDislikeClick}
            active={status.disliked}
            count={status.dislikes_count}
            theme={statusActionButtonTheme}
          />
        )}

        {(acceptsZaps || acceptsZapsCashu) && (
          <StatusActionButton
            title={intl.formatMessage(messages.zap)}
            icon={boltIcon}
            color='accent'
            filled
            onClick={handleZapClick}
            active={status.zapped_cashu || status.zapped}
            theme={statusActionButtonTheme}
            count={(status?.zaps_amount ?? 0) / 1000 + (status?.zaps_amount_cashu ?? 0)}
          />
        )}

        {canShare && (
          <StatusActionButton
            title={intl.formatMessage(messages.share)}
            icon={uploadIcon}
            onClick={handleShareClick}
            theme={statusActionButtonTheme}
          />
        )}

        <DropdownMenu items={menu} status={status.toJS() as StatusEntity}>
          <StatusActionButton
            title={intl.formatMessage(messages.more)}
            icon={dotsIcon}
            theme={statusActionButtonTheme}
          />
        </DropdownMenu>
      </HStack>
    </HStack>
  );
};

export default StatusActionBar;
