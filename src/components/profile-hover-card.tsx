import { useFloating } from '@floating-ui/react';
import flameIcon from '@tabler/icons/filled/flame.svg';
import calendarIcon from '@tabler/icons/outline/calendar.svg';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { fetchRelationships } from 'soapbox/actions/accounts.ts';
import {
  closeProfileHoverCard,
  updateProfileHoverCard,
} from 'soapbox/actions/profile-hover-card.ts';
import { useAccount, usePatronUser } from 'soapbox/api/hooks/index.ts';
import Badge from 'soapbox/components/badge.tsx';
import Markup from 'soapbox/components/markup.tsx';
import StillImage from 'soapbox/components/still-image.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import VerificationBadge from 'soapbox/components/verification-badge.tsx';
import ActionButton from 'soapbox/features/ui/components/action-button.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

import { showProfileHoverCard } from './hover-ref-wrapper.tsx';
import { dateFormatOptions } from './relative-timestamp.tsx';

import type { Account, PatronUser } from 'soapbox/schemas/index.ts';
import type { AppDispatch } from 'soapbox/store.ts';

const messages = defineMessages({
  streak: { id: 'account.streak', defaultMessage: 'Day Streak' },
});

const getBadges = (
  account?: Pick<Account, 'admin' | 'moderator'>,
  patronUser?: Pick<PatronUser, 'is_patron'>,
): JSX.Element[] => {
  const badges = [];

  if (account?.admin) {
    badges.push(<Badge key='admin' slug='admin' title={<FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />} />);
  } else if (account?.moderator) {
    badges.push(<Badge key='moderator' slug='moderator' title={<FormattedMessage id='account_moderation_modal.roles.moderator' defaultMessage='Moderator' />} />);
  }

  if (patronUser?.is_patron) {
    badges.push(<Badge key='patron' slug='patron' title={<FormattedMessage id='account.patron' defaultMessage='Patron' />} />);
  }

  return badges;
};

const handleMouseEnter = (dispatch: AppDispatch): React.MouseEventHandler => {
  return () => {
    dispatch(updateProfileHoverCard());
  };
};

const handleMouseLeave = (dispatch: AppDispatch): React.MouseEventHandler => {
  return () => {
    dispatch(closeProfileHoverCard(true));
  };
};

interface IProfileHoverCard {
  visible?: boolean;
}

/** Popup profile preview that appears when hovering avatars and display names. */
export const ProfileHoverCard: React.FC<IProfileHoverCard> = ({ visible = true }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const me = useAppSelector(state => state.me);
  const accountId: string | undefined = useAppSelector(state => state.profile_hover_card.accountId || undefined);
  const { account } = useAccount(accountId, { withRelationship: true });
  const { patronUser } = usePatronUser(account?.url);
  const { displayFqn } = useSoapboxConfig();
  const targetRef = useAppSelector(state => state.profile_hover_card.ref?.current);
  const badges = getBadges(account, patronUser);

  useEffect(() => {
    if (accountId) dispatch(fetchRelationships([accountId]));
  }, [dispatch, accountId]);

  useEffect(() => {
    const unlisten = history.listen(() => {
      showProfileHoverCard.cancel();
      dispatch(closeProfileHoverCard());
    });

    return () => {
      unlisten();
    };
  }, []);

  const { floatingStyles } = useFloating({
    elements: {
      floating: popperElement,
      reference: targetRef,
    },
  });

  if (!account) return null;
  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const followedBy = me !== account.id && account.relationship?.followed_by === true;

  return (
    <div
      className={clsx({
        'absolute transition-opacity w-[320px] z-[101] top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={floatingStyles}
      onMouseEnter={handleMouseEnter(dispatch)}
      onMouseLeave={handleMouseLeave(dispatch)}
    >
      <Card className='relative isolate overflow-hidden border border-gray-200' rounded slim>
        <CardBody className='relative'>
          <div className='relative h-24 overflow-hidden bg-gray-200'>
            <StillImage src={account.header} />
          </div>

          <Stack space={2} className='-mt-12 px-3 pb-3'>
            <HStack justifyContent='between'>
              <Link to={`/@${account.acct}`} title={account.acct}>
                <Avatar src={account.avatar} size={80} className='size-20 overflow-hidden bg-gray-50 ring-2 ring-white' />
              </Link>

              <div className='relative z-50 mt-2'>
                <ActionButton account={account} small />
              </div>
            </HStack>

            <Stack>
              <Link to={`/@${account.acct}`}>
                <HStack space={1} alignItems='center'>
                  <Text size='lg' weight='bold' truncate>
                    {emojifyText(account.display_name, account.emojis)}
                  </Text>

                  {account.verified && <VerificationBadge />}

                  {badges && badges.length > 0 && (
                    <HStack space={1} alignItems='center'>
                      {badges}
                    </HStack>
                  )}
                </HStack>
              </Link>

              <HStack>
                {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                <Text size='sm' theme='muted' direction='ltr' truncate>
                  @{displayFqn ? account.fqn : account.acct}
                </Text>
              </HStack>
            </Stack>

            <HStack alignItems='center' space={3}>
              {account.followers_count >= 0 && (
                <Link to={`/@${account.acct}/followers`} title={intl.formatNumber(account.followers_count)}>
                  <HStack alignItems='center' space={1}>
                    <Text theme='primary' weight='bold' size='sm'>
                      {shortNumberFormat(account.followers_count)}
                    </Text>
                    <Text weight='bold' size='sm'>
                      <FormattedMessage id='account.followers' defaultMessage='Followers' />
                    </Text>
                  </HStack>
                </Link>
              )}

              {account.following_count >= 0 && (
                <Link to={`/@${account.acct}/following`} title={intl.formatNumber(account.following_count)}>
                  <HStack alignItems='center' space={1}>
                    <Text theme='primary' weight='bold' size='sm'>
                      {shortNumberFormat(account.following_count)}
                    </Text>
                    <Text weight='bold' size='sm'>
                      <FormattedMessage id='account.follows' defaultMessage='Following' />
                    </Text>
                  </HStack>
                </Link>
              )}

              {account.ditto?.streak?.days > 0 && (
                <HStack alignItems='center'>
                  <Text theme='primary'>
                    <span role='img' aria-label={intl.formatMessage(messages.streak)}>
                      <Icon src={flameIcon} className='size-4' />
                    </span>
                  </Text>
                  <Text weight='bold' size='sm' className='text-black'>
                    {shortNumberFormat(account.ditto.streak.days)}
                  </Text>
                </HStack>
              )}
            </HStack>

            {account.local ? (
              <HStack alignItems='center' space={0.5}>
                <Icon
                  src={calendarIcon}
                  className='size-4 text-gray-800 dark:text-gray-200'
                />

                <Text size='sm' title={intl.formatDate(account.created_at, dateFormatOptions)}>
                  <FormattedMessage
                    id='account.member_since' defaultMessage='Joined {date}' values={{
                      date: memberSinceDate,
                    }}
                  />
                </Text>
              </HStack>
            ) : null}

            {account.note.length > 0 && (
              <Markup size='sm' emojis={account.emojis} html={{ __html: account.note }} />
            )}
          </Stack>

          {followedBy && (
            <div className='absolute left-2 top-2'>
              <Badge
                slug='opaque'
                title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfileHoverCard;
