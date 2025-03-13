import folderOpenIcon from '@tabler/icons/outline/folder-open.svg';
import { QRCodeCanvas } from 'qrcode.react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from 'soapbox/components/account.tsx';
import CopyableInput from 'soapbox/components/copyable-input.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { ZapSplitData } from 'soapbox/schemas/zap-split.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';

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
    return (
      <div className='max-w-[280px] truncate'>
        <FormattedMessage
          id='nutzap.send_to'
          defaultMessage='Send cashus to {target}'
          values={{ target: emojifyText(account.display_name, account.emojis) }}
        />
      </div>
    );
  };


  return (
    <div className='flex w-full flex-col items-center justify-center sm:flex-row'>
      <Stack space={10} alignItems='center' className='relative flex w-full pb-4 pt-2 sm:w-4/5'>

        <Stack space={4} justifyContent='center' className='w-full' alignItems='center'>
          <Stack justifyContent='center' alignItems='center' className='w-3/5'>
            <div className='max-w-[190px]'>
              <Account account={account} showProfileHoverCard={false} />
            </div>
          </Stack>
          <div className='-mx-4 w-full border-b border-solid bg-gray-500 dark:border-gray-800 sm:-mx-10' />

          <Stack justifyContent='center' alignItems='center' className='min-w-72 text-center' space={4}>
            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
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
          <div className='rounded-none border-0 border-b-2 p-0.5 text-center shadow-none !ring-0 dark:bg-transparent'>
            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
            <span className='!text-5xl font-bold'>{zapAmount}</span> sats
          </div>
        </div>


        <a className='flex gap-2' href='/'>
          <p className='text-sm'>
            <FormattedMessage id='zap_split.question' defaultMessage='Why am I paying this?' />
          </p>
        </a>

      </Stack>
      {invoice &&  <div className='mt-4 flex w-full border-t border-gray-500 pt-4 sm:ml-4 sm:w-4/5 sm:border-l sm:border-t-0 sm:pl-4'>
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
              <Button type='submit' theme='primary' icon={folderOpenIcon} text={intl.formatMessage(messages.zap_open_wallet)} />
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

