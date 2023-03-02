import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { HotKeys } from 'react-hotkeys';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { mentionCompose, replyCompose } from 'soapbox/actions/compose';
import { toggleFavourite, toggleReblog } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { toggleStatusHidden } from 'soapbox/actions/statuses';
import Icon from 'soapbox/components/icon';
import TranslateButton from 'soapbox/components/translate-button';
import AccountContainer from 'soapbox/containers/account-container';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';
import { useAppDispatch, useSettings } from 'soapbox/hooks';
import { defaultMediaVisibility, textForScreenReader, getActualStatus } from 'soapbox/utils/status';

import EventPreview from './event-preview';
import StatusActionBar from './status-action-bar';
import StatusContent from './status-content';
import StatusMedia from './status-media';
import StatusReplyMentions from './status-reply-mentions';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';
import StatusInfo from './statuses/status-info';
import { Card, Stack, Text } from './ui';

import type {
  Account as AccountEntity,
  Group as GroupEntity,
  Status as StatusEntity,
} from 'soapbox/types/entities';

// Defined in components/scrollable-list
export type ScrollPosition = { height: number, top: number };

const messages = defineMessages({
  reblogged_by: { id: 'status.reblogged_by', defaultMessage: '{name} reposted' },
});

export interface IStatus {
  id?: string
  avatarSize?: number
  status: StatusEntity
  onClick?: () => void
  muted?: boolean
  hidden?: boolean
  unread?: boolean
  onMoveUp?: (statusId: string, featured?: boolean) => void
  onMoveDown?: (statusId: string, featured?: boolean) => void
  focusable?: boolean
  featured?: boolean
  hideActionBar?: boolean
  hoverable?: boolean
  variant?: 'default' | 'rounded'
  showGroup?: boolean
  accountAction?: React.ReactElement
}

const Status: React.FC<IStatus> = (props) => {
  const {
    status,
    accountAction,
    avatarSize = 42,
    focusable = true,
    hoverable = true,
    onClick,
    onMoveUp,
    onMoveDown,
    muted,
    hidden,
    featured,
    unread,
    hideActionBar,
    variant = 'rounded',
    showGroup = true,
  } = props;

  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const displayMedia = settings.get('displayMedia') as string;
  const didShowCard = useRef(false);
  const node = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));
  const [minHeight, setMinHeight] = useState(208);

  const actualStatus = getActualStatus(status);
  const isReblog = status.reblog && typeof status.reblog === 'object';
  const statusUrl = `/@${actualStatus.getIn(['account', 'acct'])}/posts/${actualStatus.id}`;
  const group = actualStatus.group as GroupEntity | null;

  // Track height changes we know about to compensate scrolling.
  useEffect(() => {
    didShowCard.current = Boolean(!muted && !hidden && status?.card);
  }, []);

  useEffect(() => {
    setShowMedia(defaultMediaVisibility(status, displayMedia));
  }, [status.id]);

  useEffect(() => {
    if (overlay.current) {
      setMinHeight(overlay.current.getBoundingClientRect().height);
    }
  }, [overlay.current]);

  const handleToggleMediaVisibility = (): void => {
    setShowMedia(!showMedia);
  };

  const handleClick = (e?: React.MouseEvent): void => {
    e?.stopPropagation();

    // If the user is selecting text, don't focus the status.
    if (getSelection()?.toString().length) {
      return;
    }

    if (!e || !(e.ctrlKey || e.metaKey)) {
      if (onClick) {
        onClick();
      } else {
        history.push(statusUrl);
      }
    } else {
      window.open(statusUrl, '_blank');
    }
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent): void => {
    const status = actualStatus;
    const firstAttachment = status.media_attachments.first();

    e?.preventDefault();

    if (firstAttachment) {
      if (firstAttachment.type === 'video') {
        dispatch(openModal('VIDEO', { status, media: firstAttachment, time: 0 }));
      } else {
        dispatch(openModal('MEDIA', { status, media: status.media_attachments, index: 0 }));
      }
    }
  };

  const handleHotkeyReply = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(replyCompose(actualStatus));
  };

  const handleHotkeyFavourite = (): void => {
    toggleFavourite(actualStatus);
  };

  const handleHotkeyBoost = (e?: KeyboardEvent): void => {
    const modalReblog = () => dispatch(toggleReblog(actualStatus));
    const boostModal = settings.get('boostModal');
    if ((e && e.shiftKey) || !boostModal) {
      modalReblog();
    } else {
      dispatch(openModal('BOOST', { status: actualStatus, onReblog: modalReblog }));
    }
  };

  const handleHotkeyMention = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(mentionCompose(actualStatus.account as AccountEntity));
  };

  const handleHotkeyOpen = (): void => {
    history.push(statusUrl);
  };

  const handleHotkeyOpenProfile = (): void => {
    history.push(`/@${actualStatus.getIn(['account', 'acct'])}`);
  };

  const handleHotkeyMoveUp = (e?: KeyboardEvent): void => {
    if (onMoveUp) {
      onMoveUp(status.id, featured);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent): void => {
    if (onMoveDown) {
      onMoveDown(status.id, featured);
    }
  };

  const handleHotkeyToggleHidden = (): void => {
    dispatch(toggleStatusHidden(actualStatus));
  };

  const handleHotkeyToggleSensitive = (): void => {
    handleToggleMediaVisibility();
  };

  const handleHotkeyReact = (): void => {
    _expandEmojiSelector();
  };

  const _expandEmojiSelector = (): void => {
    const firstEmoji: HTMLDivElement | null | undefined = node.current?.querySelector('.emoji-react-selector .emoji-react-selector__emoji');
    firstEmoji?.focus();
  };

  const renderStatusInfo = () => {
    if (isReblog) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          to={`/@${status.getIn(['account', 'acct'])}`}
          icon={<Icon src={require('@tabler/icons/repeat.svg')} className='text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by'
              defaultMessage='{name} reposted'
              values={{
                name: (
                  <bdi className='truncate pr-1 rtl:pl-1'>
                    <strong
                      className='text-gray-800 dark:text-gray-200'
                      dangerouslySetInnerHTML={{
                        __html: String(status.getIn(['account', 'display_name_html'])),
                      }}
                    />
                  </bdi>
                ),
              }}
            />
          }
        />
      );
    } else if (featured) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={require('@tabler/icons/pinned.svg')} className='text-gray-600 dark:text-gray-400' />}
          text={
            <Text size='xs' theme='muted' weight='medium'>
              <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
            </Text>
          }
        />
      );
    } else if (showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          to={`/groups/${group.id}`}
          icon={<Icon src={require('@tabler/icons/circles.svg')} className='text-gray-600 dark:text-gray-400' />}
          text={
            <Text size='xs' theme='muted' weight='medium'>
              <FormattedMessage
                id='status.group'
                defaultMessage='Posted in {group}'
                values={{ group: (
                  <span dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
                ) }}
              />
            </Text>
          }
        />
      );
    }
  };

  if (!status) return null;

  if (hidden) {
    return (
      <div ref={node}>
        <>
          {actualStatus.getIn(['account', 'display_name']) || actualStatus.getIn(['account', 'username'])}
          {actualStatus.content}
        </>
      </div>
    );
  }

  if (status.filtered || actualStatus.filtered) {
    const minHandlers = muted ? undefined : {
      moveUp: handleHotkeyMoveUp,
      moveDown: handleHotkeyMoveDown,
    };

    return (
      <HotKeys handlers={minHandlers}>
        <div className={clsx('status__wrapper text-center', { focusable })} tabIndex={focusable ? 0 : undefined} ref={node}>
          <Text theme='muted'>
            <FormattedMessage id='status.filtered' defaultMessage='Filtered' />
          </Text>
        </div>
      </HotKeys>
    );
  }

  let rebloggedByText;
  if (status.reblog && typeof status.reblog === 'object') {
    rebloggedByText = intl.formatMessage(
      messages.reblogged_by,
      { name: String(status.getIn(['account', 'acct'])) },
    );
  }

  let quote;

  if (actualStatus.quote) {
    if (actualStatus.pleroma.get('quote_visible', true) === false) {
      quote = (
        <div className='quoted-status-tombstone'>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={actualStatus.quote as string} />;
    }
  }

  const handlers = muted ? undefined : {
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    open: handleHotkeyOpen,
    openProfile: handleHotkeyOpenProfile,
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    toggleHidden: handleHotkeyToggleHidden,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  const isUnderReview = actualStatus.visibility === 'self';
  const isSensitive = actualStatus.hidden;

  return (
    <HotKeys handlers={handlers} data-testid='status'>
      <div
        className={clsx('status cursor-pointer', { focusable })}
        tabIndex={focusable && !muted ? 0 : undefined}
        data-featured={featured ? 'true' : null}
        aria-label={textForScreenReader(intl, actualStatus, rebloggedByText)}
        ref={node}
        onClick={handleClick}
        role='link'
      >
        <Card
          variant={variant}
          className={clsx('status__wrapper space-y-4', `status-${actualStatus.visibility}`, {
            'py-6 sm:p-5': variant === 'rounded',
            'status-reply': !!status.in_reply_to_id,
            muted,
            read: unread === false,
          })}
          data-id={status.id}
        >
          {renderStatusInfo()}

          <AccountContainer
            key={String(actualStatus.getIn(['account', 'id']))}
            id={String(actualStatus.getIn(['account', 'id']))}
            timestamp={actualStatus.created_at}
            timestampUrl={statusUrl}
            action={accountAction}
            hideActions={!accountAction}
            showEdit={!!actualStatus.edited_at}
            showProfileHoverCard={hoverable}
            withLinkToProfile={hoverable}
            approvalStatus={actualStatus.approval_status}
            avatarSize={avatarSize}
          />

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={actualStatus} hoverable={hoverable} />

            <Stack
              className='relative z-0'
              style={{ minHeight: isUnderReview || isSensitive ? Math.max(minHeight, 208) + 12 : undefined }}
            >
              {(isUnderReview || isSensitive) && (
                <SensitiveContentOverlay
                  status={status}
                  visible={showMedia}
                  onToggleVisibility={handleToggleMediaVisibility}
                  ref={overlay}
                />
              )}

              {actualStatus.event ? <EventPreview className='shadow-xl' status={actualStatus} /> : (
                <Stack space={4}>
                  <StatusContent
                    status={actualStatus}
                    onClick={handleClick}
                    collapsable
                    translatable
                  />

                  <TranslateButton status={actualStatus} />

                  {(quote || actualStatus.card || actualStatus.media_attachments.size > 0) && (
                    <Stack space={4}>
                      <StatusMedia
                        status={actualStatus}
                        muted={muted}
                        onClick={handleClick}
                        showMedia={showMedia}
                        onToggleVisibility={handleToggleMediaVisibility}
                      />

                      {quote}
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>

            {(!hideActionBar && !isUnderReview) && (
              <div className='pt-4'>
                <StatusActionBar status={actualStatus} />
              </div>
            )}
          </div>
        </Card>
      </div >
    </HotKeys >
  );
};

export default Status;
