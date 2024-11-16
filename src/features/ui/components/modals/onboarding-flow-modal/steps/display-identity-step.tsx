import helpSquare from '@tabler/icons/outline/help-square-rounded.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Popover from 'soapbox/components/ui/popover.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Textarea from 'soapbox/components/ui/textarea.tsx';
import { UsernameInput } from 'soapbox/features/edit-identity/index.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import toast from 'soapbox/toast.tsx';

const closeIcon = xIcon;

const messages = defineMessages({
  title: { id: 'onboarding.display_identity.title', defaultMessage: 'Choose an Identity' },
  subtitle: { id: 'onboarding.display_identity.subtitle', defaultMessage: 'You can always edit this later.' },
  label: { id: 'onboarding.display_identity.label', defaultMessage: 'Identity' },
  helpText: { id: 'onboarding.display_identity.help_text', defaultMessage: 'This identifier is a unique username that represents you on the platform. This username can be used to personalize your experience and facilitate communication within the community.' },
  placeholder: { id: 'onboarding.display_identity.fields.reason_placeholder', defaultMessage: 'Why do you want to be part of the {siteTitle} community?' },
  requested: { id: 'onboarding.display_identity.request', defaultMessage: 'Username requested' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
  saving: { id: 'onboarding.saving', defaultMessage: 'Saving…' },
  next: { id: 'onboarding.next', defaultMessage: 'Next' },
  skip: { id: 'onboarding.skip', defaultMessage: 'Skip for now' },
});

interface IDisplayUserNameStep {
  onClose?(): void;
  onNext: () => void;
}

interface NameRequestData {
  name: string;
  reason?: string;
}

function useRequestName() {
  const api = useApi();

  return useMutation({
    mutationFn: (data: NameRequestData) => api.post('/api/v1/ditto/names', data),
  });
}

const DisplayUserNameStep: React.FC<IDisplayUserNameStep> = ({ onClose, onNext }) => {
  const intl = useIntl();
  const { instance } = useInstance();
  const { mutate } = useRequestName();
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);

  const [username, setUsername] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const trimmedValue = username.trim();
  const isValid = trimmedValue.length > 0;
  const isDisabled = !isValid || username.length > 30;

  const handleSubmit = () => {
    const name = `${username}@${instance.domain}`;

    setSubmitting(true);

    mutate({ name, reason }, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.requested));
        queryClient.invalidateQueries({
          queryKey: ['names', 'pending'],
        });
        setSubmitting(false);
      }, onError() {
        toast.error(intl.formatMessage(messages.error));
      },
    });
  };

  return (
    <Stack space={2} justifyContent='center' alignItems='center' className='relative w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:p-10'>

      {/* <HeaderSteps onClose={onClose} title={intl.formatMessage(messages.title)} subtitle={intl.formatMessage(messages.subtitle)} /> */}
      <div className='relative w-full'>
        <IconButton src={closeIcon} onClick={onClose} className='absolute -right-2 -top-6 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' />
        <Stack space={2} justifyContent='center' alignItems='center' className='-mx-4 mb-4 border-b border-solid pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Text size='2xl' align='center' weight='bold'>
            <FormattedMessage id='onboarding.header.title' defaultMessage='Pick a cover image' />
          </Text>
          <Text theme='muted' align='center'>
            <FormattedMessage id='onboarding.header.subtitle' defaultMessage='This will be shown at the top of your profile.' />
          </Text>
        </Stack>
      </div>

      <Stack space={5} justifyContent='center' alignItems='center' className='w-full'>
        <div className='w-full sm:w-3/4'>
          <FormGroup
            labelText={
              <HStack space={2}>
                <div>
                  {intl.formatMessage(messages.label)}
                </div>
                <Popover
                  interaction='hover' content={
                    <Text className='w-48 text-justify sm:w-72'>
                      {intl.formatMessage(messages.helpText)}
                    </Text>
                  }
                >
                  <div>
                    <SvgIcon size={20} src={helpSquare} className='hover:cursor-pointer' />
                  </div>
                </Popover>

              </HStack>
            }
          >
            <Stack space={4}>
              <UsernameInput value={username} onChange={(e) => setUsername(e.target.value)} />
              <Textarea
                name='reason'
                placeholder={intl.formatMessage(messages.placeholder, { siteTitle: instance.title })}
                maxLength={500}
                onChange={(e) => setReason(e.target.value)}
                value={reason}
                autoGrow
                required
              />
            </Stack>
          </FormGroup>
        </div>

        <Stack justifyContent='center' space={2} className='w-full sm:w-3/4'>
          <Button block theme='primary' type='button' onClick={handleSubmit} disabled={isDisabled || isSubmitting}>
            {isSubmitting ? (
              intl.formatMessage(messages.saving)
            ) : (
              intl.formatMessage(messages.next)
            )}
          </Button>

          <Button block theme='tertiary' type='button' onClick={onNext}>
            {intl.formatMessage(messages.skip)}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};


export default DisplayUserNameStep;