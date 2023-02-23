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
import Badge from 'soapbox/components/badge';
import ActionButton from 'soapbox/features/ui/components/action-button';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import { UserPanel } from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import { isLocal } from 'soapbox/utils/accounts';

import { showProfileHoverCard } from './hover-ref-wrapper';
import { Card, CardBody, HStack, Icon, Stack, Text } from './ui';

import type { AppDispatch } from 'soapbox/store';
import type { Account } from 'soapbox/types/entities';

const getAccount = makeGetAccount();

const getBadges = (account: Account): JSX.Element[] => {
  const badges = [];

  if (account.admin) {
    badges.push(<Badge key='admin' slug='admin' title='Admin' />);
  } else if (account.moderator) {
    badges.push(<Badge key='moderator' slug='moderator' title='Moderator' />);
  }

  if (account.getIn(['patron', 'is_patron'])) {
    badges.push(<Badge key='patron' slug='patron' title='Patron' />);
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
  const account   = useAppSelector(state => accountId && getAccount(state, accountId));
  const targetRef = useAppSelector(state => state.profile_hover_card.ref?.current);
  const badges = account ? getBadges(account) : [];

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
      <Card variant='rounded' className='relative isolate'>
        <CardBody>
          <Stack space={2}>
            <BundleContainer fetchComponent={UserPanel}>
              {Component => (
                <Component
                  accountId={account.get('id')}
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
            <div className='absolute top-2 left-2'>
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
