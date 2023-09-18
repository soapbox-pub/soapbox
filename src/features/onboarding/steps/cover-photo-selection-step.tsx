import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me';
import StillImage from 'soapbox/components/still-image';
import { Avatar, Button, Card, CardBody, Icon, Spinner, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import toast from 'soapbox/toast';
import { isDefaultHeader } from 'soapbox/utils/accounts';
import resizeImage from 'soapbox/utils/resize-image';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  header: { id: 'account.header.alt', defaultMessage: 'Profile header' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

const CoverPhotoSelectionStep = ({ onNext }: { onNext: () => void }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();

  const fileInput = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<string | null>();
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [isDisabled, setDisabled] = React.useState<boolean>(true);
  const isDefault = account ? isDefaultHeader(account.header) : false;

  const openFilePicker = () => {
    fileInput.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxPixels = 1920 * 1080;
    const rawFile = event.target.files?.item(0);

    if (!rawFile) return;

    resizeImage(rawFile, maxPixels).then((file) => {
      const url = file ? URL.createObjectURL(file) : account?.header as string;

      setSelectedFile(url);
      setSubmitting(true);

      const formData = new FormData();
      formData.append('header', file);
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
    <Card variant='rounded' size='xl'>
      <CardBody>
        <div>
          <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
            <Stack space={2}>
              <Text size='2xl' align='center' weight='bold'>
                <FormattedMessage id='onboarding.header.title' defaultMessage='Pick a cover image' />
              </Text>

              <Text theme='muted' align='center'>
                <FormattedMessage id='onboarding.header.subtitle' defaultMessage='This will be shown at the top of your profile.' />
              </Text>
            </Stack>
          </div>

          <div className='mx-auto sm:w-2/3 sm:pt-10 md:w-1/2'>
            <Stack space={10}>
              <div className='rounded-lg border border-solid border-gray-200 dark:border-gray-800'>
                <div
                  role='button'
                  className='relative flex h-24 items-center justify-center rounded-t-md bg-gray-200 dark:bg-gray-800'
                >
                  {selectedFile || account?.header && (
                    <StillImage
                      src={selectedFile || account.header}
                      alt={intl.formatMessage(messages.header)}
                      className='absolute inset-0 rounded-t-md object-cover'
                    />
                  )}

                  {isSubmitting && (
                    <div
                      className='absolute inset-0 flex items-center justify-center rounded-t-md bg-white/80 dark:bg-primary-900/80'
                    >
                      <Spinner withText={false} />
                    </div>
                  )}

                  <button
                    onClick={openFilePicker}
                    type='button'
                    className={clsx({
                      'absolute -top-3 -right-3 p-1 bg-primary-600 rounded-full ring-2 ring-white dark:ring-primary-900 hover:bg-primary-700': true,
                      'opacity-50 pointer-events-none': isSubmitting,
                    })}
                    disabled={isSubmitting}
                  >
                    <Icon src={require('@tabler/icons/plus.svg')} className='h-5 w-5 text-white' />
                  </button>

                  <input type='file' className='hidden' ref={fileInput} onChange={handleFileChange} />
                </div>

                <div className='flex flex-col px-4 pb-4'>
                  {account && (
                    <Avatar src={account.avatar} size={64} className='-mt-8 mb-2 ring-2 ring-white dark:ring-primary-800' />
                  )}

                  <Text weight='bold' size='sm'>{account?.display_name}</Text>
                  <Text theme='muted' size='sm'>@{account?.username}</Text>
                </div>
              </div>

              <Stack justifyContent='center' space={2}>
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
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CoverPhotoSelectionStep;
