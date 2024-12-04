import circlesIcon from '@tabler/icons/outline/circles.svg';
import pinnedIcon from '@tabler/icons/outline/pinned.svg';
import repeatIcon from '@tabler/icons/outline/repeat.svg';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { mentionCompose } from 'soapbox/actions/compose.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { unfilterStatus } from 'soapbox/actions/statuses.ts';
import TranslateButton from 'soapbox/components/translate-button.tsx';
import { Card } from 'soapbox/components/ui/card.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { EntityTypes, Entities } from 'soapbox/entity-store/entities.ts';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container.tsx';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFavourite } from 'soapbox/hooks/useFavourite.ts';
import { useReblog } from 'soapbox/hooks/useReblog.ts';
import { useReplyCompose } from 'soapbox/hooks/useReplyCompose.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { useStatusHidden } from 'soapbox/hooks/useStatusHidden.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';
import { defaultMediaVisibility, textForScreenReader, getActualStatus } from 'soapbox/utils/status.ts';

import EventPreview from './event-preview.tsx';
import StatusActionBar from './status-action-bar.tsx';
import StatusContent from './status-content.tsx';
import StatusMedia from './status-media.tsx';
import StatusReplyMentions from './status-reply-mentions.tsx';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay.tsx';
import StatusInfo from './statuses/status-info.tsx';
import Tombstone from './tombstone.tsx';

// Defined in components/scrollable-list
export type ScrollPosition = { height: number; top: number };

const messages = defineMessages({
  reblogged_by: { id: 'status.reblogged_by', defaultMessage: '{name} reposted' },
});

export interface IPureStatus {
  id?: string;
  avatarSize?: number;
  status: EntityTypes[Entities.STATUSES];
  onClick?: () => void;
  muted?: boolean;
  hidden?: boolean;
  unread?: boolean;
  onMoveUp?: (statusId: string, featured?: boolean) => void;
  onMoveDown?: (statusId: string, featured?: boolean) => void;
  focusable?: boolean;
  featured?: boolean;
  hideActionBar?: boolean;
  hoverable?: boolean;
  variant?: 'default' | 'rounded' | 'slim';
  showGroup?: boolean;
  accountAction?: React.ReactElement;
}

/**
 * Status accepting the full status entity in pure format.
 */
const PureStatus: React.FC<IPureStatus> = (props) => {
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

  const { displayMedia, boostModal } = useSettings();
  const didShowCard = useRef(false);
  const node = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));
  const [minHeight, setMinHeight] = useState(208);

  const actualStatus = getActualStatus(status);
  const isReblog = status.reblog && typeof status.reblog === 'object';
  const statusUrl = `/@${actualStatus.account.acct}/posts/${actualStatus.id}`;
  const group = actualStatus.group;

  const filtered = (status.filtered.length || actualStatus.filtered.length) > 0;

  const { replyCompose } = useReplyCompose();
  const { toggleFavourite } = useFavourite();
  const { toggleReblog } = useReblog();
  const { toggleStatusHidden } = useStatusHidden();

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

  const getStatus = useCallback(makeGetStatus(), []);
  const statusImmutable = useAppSelector(state => getStatus(state, { id: status.id }));
  if (!statusImmutable) {
    return null;
  }

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
    const firstAttachment = status.media_attachments[0];

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
    replyCompose(status.id);
  };

  const handleHotkeyFavourite = (): void => {
    toggleFavourite(status.id);
  };

  const handleHotkeyBoost = (e?: KeyboardEvent): void => {
    const modalReblog = () => toggleReblog(status.id);
    if ((e && e.shiftKey) || !boostModal) {
      modalReblog();
    } else {
      dispatch(openModal('BOOST', { status: statusImmutable, onReblog: modalReblog })); // fix later
    }
  };

  const handleHotkeyMention = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(mentionCompose(actualStatus.account));
  };

  const handleHotkeyOpen = (): void => {
    history.push(statusUrl);
  };

  const handleHotkeyOpenProfile = (): void => {
    history.push(`/@${actualStatus.account.acct}`);
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
    toggleStatusHidden(status.id);
  };

  const handleHotkeyToggleSensitive = (): void => {
    handleToggleMediaVisibility();
  };

  const handleHotkeyReact = (): void => {
    _expandEmojiSelector();
  };

  const handleUnfilter = () => dispatch(unfilterStatus(status.filtered.length ? status.id : actualStatus.id));

  const _expandEmojiSelector = (): void => {
    const firstEmoji: HTMLDivElement | null | undefined = node.current?.querySelector('.emoji-react-selector .emoji-react-selector__emoji');
    firstEmoji?.focus();
  };

  const renderStatusInfo = () => {
    if (isReblog && showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={repeatIcon} className='size-4 text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by_with_group'
              defaultMessage='{name} reposted from {group}'
              values={{
                name: (
                  <Link
                    to={`/@${status.account.acct}`}
                    className='hover:underline'
                  >
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        {emojifyText(status.account.display_name, status.account.emojis)}
                      </strong>
                    </bdi>
                  </Link>
                ),
                group: (
                  <Link to={`/group/${group.slug}`} className='hover:underline'>
                    <strong className='text-gray-800 dark:text-gray-200'>
                      {group.display_name}
                    </strong>
                  </Link>
                ),
              }}
            />
          }
        />
      );
    } else if (isReblog) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={repeatIcon} className='size-4 text-green-600' />}
          text={
            <FormattedMessage
              id='status.reblogged_by'
              defaultMessage='{name} reposted'
              values={{
                name: (
                  <Link to={`/@${status.account.acct}`} className='hover:underline'>
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        {emojifyText(status.account.display_name, status.account.emojis)}
                      </strong>
                    </bdi>
                  </Link>
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
          icon={<Icon src={pinnedIcon} className='size-4 text-gray-600 dark:text-gray-400' />}
          text={
            <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
          }
        />
      );
    } else if (showGroup && group) {
      return (
        <StatusInfo
          avatarSize={avatarSize}
          icon={<Icon src={circlesIcon} className='size-4 text-primary-600 dark:text-accent-blue' />}
          text={
            <FormattedMessage
              id='status.group'
              defaultMessage='Posted in {group}'
              values={{
                group: (
                  <Link to={`/group/${group.slug}`} className='hover:underline'>
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        <span>{group.display_name}</span>
                      </strong>
                    </bdi>
                  </Link>
                ),
              }}
            />
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
          {actualStatus.account.display_name || actualStatus.account.username}
          {actualStatus.content}
        </>
      </div>
    );
  }

  if (filtered && status.showFiltered) {
    const minHandlers = muted ? undefined : {
      moveUp: handleHotkeyMoveUp,
      moveDown: handleHotkeyMoveDown,
    };

    return (
      <HotKeys handlers={minHandlers}>
        <div className={clsx('status--wrapper text-center', { focusable })} tabIndex={focusable ? 0 : undefined} ref={node}>
          {/* eslint-disable formatjs/no-literal-string-in-jsx */}
          <Text theme='muted'>
            <FormattedMessage id='status.filtered' defaultMessage='Filtered' />: {status.filtered.join(', ')}.
            {' '}
            <button className='text-primary-600 hover:underline dark:text-accent-blue' onClick={handleUnfilter}>
              <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
            </button>
          </Text>
          {/* eslint-enable formatjs/no-literal-string-in-jsx */}
        </div>
      </HotKeys>
    );
  }

  let rebloggedByText;
  if (status.reblog && typeof status.reblog === 'object') {
    rebloggedByText = intl.formatMessage(
      messages.reblogged_by,
      { name: status.account.acct },
    );
  }

  let quote;

  if (actualStatus.quote) {
    if ((actualStatus?.pleroma?.quote_visible ?? true) === false) {
      quote = (
        <div>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={actualStatus.quote.id} />;
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
  const isSoftDeleted = status.tombstone?.reason === 'deleted';

  if (isSoftDeleted) {
    return (
      <Tombstone
        id={status.id}
        onMoveUp={(id) => onMoveUp ? onMoveUp(id) : null}
        onMoveDown={(id) => onMoveDown ? onMoveDown(id) : null}
      />
    );
  }

  return (
    <HotKeys handlers={handlers} data-testid='status'>
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
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
          className={clsx('status--wrapper space-y-4', {
            'py-6 sm:p-5': variant === 'rounded', muted, read: unread === false,
          })}
          data-id={status.id}
        >
          {renderStatusInfo()}

          <AccountContainer
            key={actualStatus.account.id}
            id={actualStatus.account.id}
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

          <div className='status--content-wrapper'>
            <StatusReplyMentions status={statusImmutable} hoverable={hoverable} /> {/* fix later */}

            <Stack
              className='relative z-0'
              style={{ minHeight: isUnderReview || isSensitive ? Math.max(minHeight, 208) + 12 : undefined }}
            >
              {(isUnderReview || isSensitive) && (
                <SensitiveContentOverlay
                  status={statusImmutable} // fix later
                  visible={showMedia}
                  onToggleVisibility={handleToggleMediaVisibility}
                  ref={overlay}
                />
              )}

              {actualStatus.event ? <EventPreview className='shadow-xl' status={statusImmutable} /> : ( // fix later
                <Stack space={4}>
                  <StatusContent
                    status={statusImmutable} // fix later
                    onClick={handleClick}
                    collapsable
                    translatable
                  />

                  <TranslateButton status={statusImmutable} /> {/* fix later */}

                  {(quote || actualStatus.card || actualStatus.media_attachments.length > 0) && (
                    <Stack space={4}>
                      <StatusMedia
                        status={statusImmutable} // fix later
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
                <StatusActionBar status={statusImmutable} /> {/* fix later */}
              </div>
            )}
          </div>
        </Card>
      </div >
    </HotKeys >
  );
};

export default PureStatus;