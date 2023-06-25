import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { patchMe } from 'soapbox/actions/me';
import { Button, Card, CardBody, FormGroup, Stack, Text, Textarea } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import type { AxiosError } from 'axios';

const messages = defineMessages({
  bioPlaceholder: { id: 'onboarding.bio.placeholder', defaultMessage: 'Tell the world a little about yourself…' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

const BioStep = ({ onNext }: { onNext: () => void }) => {
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
    <Card variant='rounded' size='xl'>
      <CardBody>
        <div>
          <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
            <Stack space={2}>
              <Text size='2xl' align='center' weight='bold'>
                <FormattedMessage id='onboarding.note.title' defaultMessage='Write a short bio' />
              </Text>

              <Text theme='muted' align='center'>
                <FormattedMessage id='onboarding.note.subtitle' defaultMessage='You can always edit this later.' />
              </Text>
            </Stack>
          </div>

          <Stack space={5}>
            <div className='mx-auto sm:w-2/3 sm:pt-10'>
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

            <div className='mx-auto sm:w-2/3 md:w-1/2'>
              <Stack justifyContent='center' space={2}>
                <Button
                  block
                  theme='primary'
                  type='submit'
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
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
            </div>
          </Stack>
        </div>
      </CardBody>
    </Card>
  );
};

export default BioStep;
