import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from 'soapbox/components/account';
import CopyableInput from 'soapbox/components/copyable-input';
import { Button, Stack, HStack } from 'soapbox/components/ui';
import { ZapSplitData } from 'soapbox/schemas/zap-split';

const messages = defineMessages({
  zap_open_wallet: { id: 'zap.open_wallet', defaultMessage: 'Open Wallet' },
  zap_next: { id: 'zap.next', defaultMessage: 'Next' },
});

interface IZapSplit {
  zapData: ZapSplitData;
  invoice: string | undefined;
  zapAmount: number;
  modalStep?: React.Dispatch<React.SetStateAction<number>>;
  onNext: () => void;
  onFinish: () => void;
  isLastStep: boolean;
}

const ZapSplit = ({ zapData, zapAmount, invoice, onNext, isLastStep, onFinish }: IZapSplit) => {
  const account = zapData.account;
  const intl = useIntl();

  const renderTitleQr = () => {
    return <FormattedMessage id='zap.send_to' defaultMessage='Send zaps to {target}' values={{ target: account.display_name }} />;
  };


  return (
    <div className='flex w-full flex-col items-center justify-center sm:flex-row'>
      <Stack space={10} alignItems='center' className='relative flex w-full pb-4 pt-2 sm:w-[80%]'>

        <Stack space={4} justifyContent='center' className='w-full' alignItems='center'>
          <Stack justifyContent='center' alignItems='center' className='w-3/5'>
            <div className='max-w-[190px]'>
              <Account account={account} showProfileHoverCard={false} />
            </div>
          </Stack>
          <div className='bg-grey-500 dark:border-grey-800 -mx-4 w-full border-b border-solid sm:-mx-10' />

          <Stack justifyContent='center' alignItems='center' className='min-w-72 text-center' space={4}>
            <h3 className='text-xl font-bold'>
              Help this community grow!
            </h3>

            <p className='flex h-[90px] w-3/5 items-center justify-center'>
              {zapData.message ||
              <FormattedMessage
                id='zap_split.text'
                defaultMessage='Your support will help us build an unstoppable empire and rule the galaxy!'
              />
              }
            </p>
          </Stack>
        </Stack>

        <div className='flex justify-center'>
          <div className='box-shadow:none rounded-none border-0 border-b-2 p-0.5 text-center !ring-0 dark:bg-transparent'>
            <span className='!text-5xl font-bold'>{zapAmount}</span> sats
          </div>
        </div>


        <a className='flex gap-2' href='/'>
          <p className='text-sm'>
            <FormattedMessage id='zap_split.question' defaultMessage='Why am I paying this?' />
          </p>
        </a>

      </Stack>
      {invoice &&  <div className='border-grey-500 mt-4 flex w-full border-t pt-4 sm:ml-4 sm:w-4/5 sm:border-l sm:border-t-0 sm:pl-4'>
        <Stack space={6} className='relative m-auto' alignItems='center'>
          <h3 className='text-xl font-bold'>
            {renderTitleQr()}
          </h3>
          <QRCodeCanvas value={invoice} />
          <div className='w-full'>
            <CopyableInput value={invoice} />
          </div>
          <HStack space={2}>
            <a href={'lightning:' + invoice}>
              <Button type='submit' theme='primary' icon={require('@tabler/icons/outline/folder-open.svg')} text={intl.formatMessage(messages.zap_open_wallet)} />
            </a>
            {isLastStep ? (
              <Button
                type='button'
                onClick={onFinish}
                theme='muted'
                className='!font-bold'
                text={intl.formatMessage({ id: 'zap.finish', defaultMessage: 'Finish' })}
              />
            ) : (
              <Button
                type='button'
                onClick={onNext}
                theme='muted'
                className='!font-bold'
                text={intl.formatMessage(messages.zap_next)}
              />
            )}
          </HStack>
        </Stack>
      </div>}
    </div>

  );
};

export default ZapSplit;

