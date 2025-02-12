import flameIcon from '@tabler/icons/filled/flame.svg';
import React from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Link } from 'react-router-dom';

import StillImage from 'soapbox/components/still-image.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import VerificationBadge from 'soapbox/components/verification-badge.tsx';
import ActionButton from 'soapbox/features/ui/components/action-button.tsx';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

const messages = defineMessages({
  streak: { id: 'account.streak', defaultMessage: 'Day Streak' },
});

interface IStreakModal {
  onClose: () => void;
}

const StreakModal: React.FC<IStreakModal> = ({ onClose }) => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  if (!account) return null;

  // const streakCount = account ? shortNumberFormat(account.ditto.streak.days) : 0;

  return (
    <Modal
      title={
        <HStack alignItems='center' justifyContent='center' space={1} className='my-6 -mr-8'>
          <Text weight='bold' size='2xl' className='text-black'>
            <FormattedMessage id='streak_modal.title' defaultMessage="You've unlocked a" />
          </Text>
          <Text theme='primary'>
            <Icon src={flameIcon} className='size-6' />
          </Text>
          <Text weight='bold' size='2xl' className='text-black'>
            <FormattedMessage id='streak_modal.sub' defaultMessage='streak!' />
          </Text>
        </HStack>
      }
      onClose={onClose}
    >
      <div className='mx-auto'>
        <Card className='relative isolate mx-auto my-4 w-80 overflow-hidden border border-gray-200' rounded slim>
          <CardBody className='relative'>
            <div className='relative h-14 overflow-hidden bg-gray-200'>
              <StillImage src={account.header} />
            </div>

            <Stack space={2} className='-mt-12 px-3 pb-3'>
              <HStack justifyContent='between'>
                <Link to={`/@${account.acct}`} title={account.acct}>
                  <Avatar src={account.avatar} size={80} className='size-20 overflow-hidden bg-gray-50 ring-2 ring-white' />
                </Link>

                <div className='mt-2'>
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
                  </HStack>
                </Link>
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

            </Stack>

          </CardBody>
        </Card>
      </div>
      <HStack justifyContent='center'>
        <Text className='my-6'>
          <FormattedMessage id='streak_modal.message' defaultMessage='Post every day to keep it going.' />
        </Text>
      </HStack>
    </Modal>
  );
};

export default StreakModal;