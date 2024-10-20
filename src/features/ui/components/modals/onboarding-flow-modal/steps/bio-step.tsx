import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me';
import { Button, FormGroup, Stack, Textarea } from 'soapbox/components/ui';
import { HeaderSteps } from 'soapbox/features/ui/components/modals/onboarding-flow-modal/header-steps';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  bioPlaceholder: { id: 'onboarding.bio.placeholder', defaultMessage: 'Tell the world a little about yourself…' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

interface IBioStep {
  onClose(): void;
  onNext: () => void;
}

const BioStep: React.FC<IBioStep> = ({ onClose, onNext }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const [value, setValue] = React.useState<string>(account?.source?.note ?? '');
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = () => {
    setSubmitting(true);

    const credentials = dispatch(patchMe({ note: value }));

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

    <Stack space={2} justifyContent='center' alignItems='center' className='relative w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:p-10'>

      <HeaderSteps onClose={onClose} title={<FormattedMessage id='onboarding.note.title' defaultMessage='Write a short bio' />} subtitle={<FormattedMessage id='onboarding.note.subtitle' defaultMessage='You can always edit this later.' />} />

      <div className='mx-auto w-full sm:w-2/3'>
        <FormGroup
          hintText={<FormattedMessage id='onboarding.bio.hint' defaultMessage='Max 500 characters' />}
          labelText={<FormattedMessage id='edit_profile.fields.bio_label' defaultMessage='Bio' />}
          errors={errors}
        >
          <Textarea
            onChange={(event) => setValue(event.target.value)}
            placeholder={intl.formatMessage(messages.bioPlaceholder)}
            value={value}
            maxLength={500}
          />
        </FormGroup>
      </div>

      <Stack justifyContent='center' space={2} className='w-full sm:w-2/3'>
        <Button block theme='primary' type='button' onClick={handleSubmit} disabled={isSubmitting}>
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
  );
};

export default BioStep;