import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Textarea, Form, Button, FormGroup, FormActions, Text } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { captureSentryFeedback } from 'soapbox/sentry';

interface ISentryFeedbackForm {
  eventId: string;
}

/** Accept feedback for the given Sentry event. */
const SentryFeedbackForm: React.FC<ISentryFeedbackForm> = ({ eventId }) => {
  const { account } = useOwnAccount();

  const [feedback, setFeedback] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleFeedbackChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback: React.FormEventHandler = async (_e) => {
    if (!feedback || !eventId) return;
    setIsSubmitting(true);

    await captureSentryFeedback({
      name: account?.acct,
      associatedEventId: eventId,
      message: feedback,
    }).catch(console.error);

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Text align='center'>
        <FormattedMessage id='alert.unexpected.thanks' defaultMessage='Thanks for your feedback!' />
      </Text>
    );
  }

  return (
    <Form onSubmit={handleSubmitFeedback}>
      <FormGroup>
        <Textarea
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder='Anything you can tell us about what happened?'
          disabled={isSubmitting}
          autoGrow
        />
      </FormGroup>

      <FormActions>
        <Button type='submit' className='mx-auto' disabled={!feedback || isSubmitting}>
          <FormattedMessage id='alert.unexpected.submit_feedback' defaultMessage='Submit Feedback' />
        </Button>
      </FormActions>
    </Form>
  );
};

export default SentryFeedbackForm;