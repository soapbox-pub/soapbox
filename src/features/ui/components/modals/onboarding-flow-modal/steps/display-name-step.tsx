import xIcon from '@tabler/icons/outline/x.svg';
import { useMemo, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me.ts';
import Button from 'soapbox/components/ui/button.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks/index.ts';
import toast from 'soapbox/toast.tsx';

import type { AxiosError } from 'axios';

const closeIcon = xIcon;

const messages = defineMessages({
  usernamePlaceholder: { id: 'onboarding.display_name.placeholder', defaultMessage: 'Eg. John Smith' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

interface IDisplayNameStep {
  onClose?(): void;
  onNext: () => void;
}

const DisplayNameStep: React.FC<IDisplayNameStep> = ({ onClose, onNext }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const [value, setValue] = useState<string>(account?.display_name || '');
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const trimmedValue = value.trim();
  const isValid = trimmedValue.length > 0;
  const isDisabled = !isValid || value.length > 30;

  const hintText = useMemo(() => {
    const charsLeft = 30 - value.length;
    const suffix = charsLeft === 1 ? 'character remaining' : 'characters remaining';

    return `${charsLeft} ${suffix}`;
  }, [value]);

  const handleSubmit = () => {
    setSubmitting(true);

    const credentials = dispatch(patchMe({ display_name: value }));

    Promise.all([credentials])
      .then(() => {
        setSubmitting(false);
        onNext();
      }).catch((error: AxiosError) => {
        setSubmitting(false);

        if (error.response?.status === 422) {
          setErrors([(error.response.data as any).error.replace('Validation failed: ', '')]);
        } else {
          toast.error(messages.error);
        }
      });
  };

  return (

    <Stack space={10} justifyContent='center' alignItems='center' className='w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:p-10'>

      <div className='relative w-full'>
        <IconButton src={closeIcon} onClick={onClose} className='absolute right-[2%] top-[-6%] text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' />
        <Stack space={2} justifyContent='center' alignItems='center' className='-mx-4 mb-4 border-b border-solid pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Text size='2xl' align='center' weight='bold'>
            <FormattedMessage id='onboarding.display_name.title' defaultMessage='Choose a display name' />
          </Text>
          <Text theme='muted' align='center'>
            <FormattedMessage id='onboarding.display_name.subtitle' defaultMessage='You can always edit this later.' />
          </Text>
        </Stack>
      </div>

      <Stack space={5} justifyContent='center' alignItems='center' className='w-full'>
        <div className='w-2/3'>
          <FormGroup
            hintText={hintText}
            labelText={<FormattedMessage id='onboarding.display_name.label' defaultMessage='Display name' />}
            errors={errors}
          >
            <Input
              onChange={(event) => setValue(event.target.value)}
              placeholder={intl.formatMessage(messages.usernamePlaceholder)}
              type='text'
              value={value}
              maxLength={30}
            />
          </FormGroup>
        </div>

        <Stack justifyContent='center' space={2} className='w-2/3'>
          <Button block theme='primary' type='button' onClick={handleSubmit} disabled={isDisabled || isSubmitting}>
            {isSubmitting ? (
              <FormattedMessage id='onboarding.saving' defaultMessage='Saving…' />
            ) : (
              <FormattedMessage id='onboarding.next' defaultMessage='Next' />
            )}
          </Button>

          <Button block theme='tertiary' type='button' onClick={onNext}>
            <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};


export default DisplayNameStep;