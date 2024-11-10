import plusIcon from '@tabler/icons/outline/plus.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

import { patchMe } from 'soapbox/actions/me.ts';
import IconButton from 'soapbox/components/ui/icon-button/icon-button.tsx';
import { Button, Stack, Text, Avatar, Icon, Spinner } from 'soapbox/components/ui/index.ts';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks/index.ts';
import toast from 'soapbox/toast.tsx';
import { isDefaultAvatar } from 'soapbox/utils/accounts.ts';
import resizeImage from 'soapbox/utils/resize-image.ts';

import type { AxiosError } from 'axios';

const closeIcon = xIcon;

const messages = defineMessages({
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});


interface IAvatarSelectionModal {
  onClose?(): void;
  onNext: () => void;
}

const AvatarSelectionModal: React.FC<IAvatarSelectionModal> = ({ onClose, onNext }) => {
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>();
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [isDisabled, setDisabled] = useState<boolean>(true);
  const isDefault = account ? isDefaultAvatar(account.avatar) : false;

  const openFilePicker = () => {
    fileInput.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxPixels = 400 * 400;
    const rawFile = event.target.files?.item(0);

    if (!rawFile) return;

    resizeImage(rawFile, maxPixels).then((file) => {
      const url = file ? URL.createObjectURL(file) : account?.avatar as string;

      setSelectedFile(url);
      setSubmitting(true);

      const formData = new FormData();
      formData.append('avatar', rawFile);
      const credentials = dispatch(patchMe(formData));

      Promise.all([credentials]).then(() => {
        setDisabled(false);
        setSubmitting(false);
        onNext();
      }).catch((error: AxiosError) => {
        setSubmitting(false);
        setDisabled(false);
        setSelectedFile(null);

        if (error.response?.status === 422) {
          toast.error((error.response.data as any).error.replace('Validation failed: ', ''));
        } else {
          toast.error(messages.error);
        }
      });
    }).catch(console.error);
  };
  return (
    <Stack space={10} justifyContent='center' alignItems='center' className='w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:p-10'>

      <div className='relative w-full'>
        <IconButton src={closeIcon} onClick={onClose} className='absolute right-[2%] top-[-6%] text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' />
        <Stack space={2} justifyContent='center' alignItems='center' className='-mx-4 mb-4 border-b border-solid pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Text size='2xl' align='center' weight='bold'>
            <FormattedMessage id='onboarding.avatar.title' defaultMessage={'Choose a profile picture'} />
          </Text>
          <Text theme='muted' align='center'>
            <FormattedMessage id='onboarding.avatar.subtitle' defaultMessage={'Just have fun with it.'} />
          </Text>
        </Stack>
      </div>

      <div className='relative mx-auto rounded-full bg-gray-200'>
        {account && (
          <Avatar src={selectedFile || account.avatar} size={175} />
        )}

        {isSubmitting && (
          <div className='absolute inset-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-primary-900/80'>
            <Spinner withText={false} />
          </div>
        )}

        <button
          onClick={openFilePicker}
          type='button'
          className={clsx({
            'absolute bottom-3 right-2 p-1 bg-primary-600 rounded-full ring-2 ring-white dark:ring-primary-900 hover:bg-primary-700': true,
            'opacity-50 pointer-events-none': isSubmitting,
          })}
          disabled={isSubmitting}
        >
          <Icon src={plusIcon} className='size-5 text-white' />
        </button>

        <input type='file' className='hidden' ref={fileInput} onChange={handleFileChange} />
      </div>

      <Stack justifyContent='center' space={2} className='w-2/3'>
        <Button block theme='primary' type='button' onClick={onNext} disabled={isDefault && isDisabled || isSubmitting}>
          {isSubmitting ? (
            <FormattedMessage id='onboarding.saving' defaultMessage='Saving…' />
          ) : (
            <FormattedMessage id='onboarding.next' defaultMessage='Next' />
          )}
        </Button>

        {isDisabled && (
          <Button block theme='tertiary' type='button' onClick={onNext}>
            <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
          </Button>
        )}
      </Stack>
    </Stack>
  );
};


export default AvatarSelectionModal;