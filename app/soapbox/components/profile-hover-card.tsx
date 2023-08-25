import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { usePopper } from 'react-popper';
import { useHistory } from 'react-router-dom';

import { fetchRelationships } from 'soapbox/actions/accounts';
import {
  closeProfileHoverCard,
  updateProfileHoverCard,
} from 'soapbox/actions/profile-hover-card';
import { useAccount, usePatronUser } from 'soapbox/api/hooks';
import Badge from 'soapbox/components/badge';
import ActionButton from 'soapbox/features/ui/components/action-button';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import { UserPanel } from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';
import { isLocal } from 'soapbox/utils/accounts';

import { showProfileHoverCard } from './hover-ref-wrapper';
import { Card, CardBody, HStack, Icon, Stack, Text } from './ui';

import type { Account, PatronUser } from 'soapbox/schemas';
import type { AppDispatch } from 'soapbox/store';

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
  visible: boolean
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

  const { styles, attributes } = usePopper(targetRef, popperElement);

  if (!account) return null;
  const accountBio = { __html: account.note_emojified };
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
      style={styles.popper}
      {...attributes.popper}
      onMouseEnter={handleMouseEnter(dispatch)}
      onMouseLeave={handleMouseLeave(dispatch)}
    >
      <Card variant='rounded' className='relative isolate overflow-hidden'>
        <CardBody>
          <Stack space={2}>
            <BundleContainer fetchComponent={UserPanel}>
              {Component => (
                <Component
                  accountId={account.id}
                  action={<ActionButton account={account} small />}
                  badges={badges}
                />
              )}
            </BundleContainer>

            {isLocal(account) ? (
              <HStack alignItems='center' space={0.5}>
                <Icon
                  src={require('@tabler/icons/calendar.svg')}
                  className='h-4 w-4 text-gray-800 dark:text-gray-200'
                />

                <Text size='sm'>
                  <FormattedMessage
                    id='account.member_since' defaultMessage='Joined {date}' values={{
                      date: memberSinceDate,
                    }}
                  />
                </Text>
              </HStack>
            ) : null}

            {account.note.length > 0 && (
              <Text size='sm' dangerouslySetInnerHTML={accountBio} />
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
