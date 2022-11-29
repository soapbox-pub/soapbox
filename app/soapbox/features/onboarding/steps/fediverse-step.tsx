import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account';
import { Button, Card, CardBody, Icon, Stack, Text } from 'soapbox/components/ui';
import { useInstance, useOwnAccount } from 'soapbox/hooks';

import type { Account as AccountEntity } from 'soapbox/types/entities';

const FediverseStep = ({ onNext }: { onNext: () => void }) => {
  const account = useOwnAccount() as AccountEntity;
  const instance = useInstance();

  return (
    <Card variant='rounded' size='xl'>
      <CardBody>
        <Stack space={2}>
          <Icon strokeWidth={1} src={require('@tabler/icons/affiliate.svg')} className='w-16 h-16 mx-auto text-primary-600 dark:text-primary-400' />

          <Text size='2xl' weight='bold'>
            <FormattedMessage
              id='onboarding.fediverse.title'
              defaultMessage='{siteTitle} is just one part of the Fediverse'
              values={{
                siteTitle: instance.title,
              }}
            />
          </Text>

          <Stack space={4}>
            <div className='border-b border-gray-200 dark:border-gray-800 border-solid pb-2 sm:pb-5'>
              <Stack space={4}>
                <Text theme='muted'>
                  <FormattedMessage
                    id='onboarding.fediverse.message'
                    defaultMessage='The Fediverse is a social network made up of thousands of diverse and independently-run social media sites (aka "servers"). You can follow users — and like, repost, and reply to posts — from most other Fediverse servers, because they can communicate with {siteTitle}.'
                    values={{
                      siteTitle: instance.title,
                    }}
                  />
                </Text>

                <Text theme='muted'>
                  <FormattedMessage
                    id='onboarding.fediverse.trailer'
                    defaultMessage='Because it is distributed and anyone can run their own server, the Fediverse is resilient and open. If you choose to join another server or set up your own, you can interact with the same people and continue on the same social graph.'
                  />
                </Text>
              </Stack>
            </div>

            <div className='bg-primary-50 dark:bg-gray-800 rounded-lg text-center p-4'>
              <Account account={account} />
            </div>

            <Text theme='muted'>
              <FormattedMessage
                id='onboarding.fediverse.its_you'
                defaultMessage='This is you! Other people can follow you from other servers by using your full @-handle.'
              />
            </Text>

            <Text theme='muted'>
              <FormattedMessage
                id='onboarding.fediverse.other_instances'
                defaultMessage='When browsing your timeline, pay attention to the full username after the second @ symbol to know which server a post is from.'
              />
            </Text>
          </Stack>
        </Stack>

        <div className='pt-10 sm:w-2/3 md:w-1/2 mx-auto'>
          <Stack justifyContent='center' space={2}>
            <Button
              block
              theme='primary'
              onClick={onNext}
            >
              <FormattedMessage id='onboarding.fediverse.next' defaultMessage='Next' />
            </Button>
          </Stack>
        </div>
      </CardBody>
    </Card>
  );
};

export default FediverseStep;
