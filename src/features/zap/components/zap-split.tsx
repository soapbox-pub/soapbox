import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account';
import { Stack, HStack } from 'soapbox/components/ui';

import type {  Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities';

interface IZapSplit {
  status?: StatusEntity;
  account: AccountEntity;
  amountAdm?: number;
  zapAmount?: number;
  step?: number;
}

const ZapSplit = ({ account, status, amountAdm = 3, zapAmount = 50, step = 2 }: IZapSplit) => {
  return (
    <Stack space={10} alignItems='center' className='relative pb-4 pt-2'>

      <Stack space={4} justifyContent='center' className='w-full' alignItems='center'>
        <Stack className='w-4/5'>
          <Account account={account} showProfileHoverCard={false} />
        </Stack>
        <div className='bg-grey-500 dark:border-grey-800 -mx-4 w-full border-b border-solid sm:-mx-10' />

        <Stack justifyContent='center' alignItems='center' className='w-full text-center' space={4}>
          {/* In the next change, this part will be editable */}
          <h3 className='text-xl font-bold'>
            Latvian creator of world
          </h3>

          {/* In the next change, this part will be editable */}
          <p className='w-3/5'>
            <FormattedMessage id='zap_split.text' defaultMessage='Your support will help us build an unstoppable empire and rule the galaxy!' />
          </p>
        </Stack>
      </Stack>

      <div className='flex justify-center'>
        <div className='box-shadow:none rounded-none border-0 border-b-2 p-0.5 text-center !ring-0 dark:bg-transparent'>
          <span className='!text-5xl font-bold'>{zapAmount}</span> sats
        </div>
      </div>

      <HStack justifyContent='center' space={2}>
        <a className='flex gap-2' href='/'>
          <p className='text-sm'>
            <FormattedMessage id='zap_split.question' defaultMessage='Why am I paying this?' />
          </p>
        </a>
        <p className='absolute right-2'>
          <span className='font-bold'>
            {step}/{amountAdm}
          </span>
        </p>
      </HStack>
    </Stack>
  );
};

export default ZapSplit;