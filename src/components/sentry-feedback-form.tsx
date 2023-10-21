import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Textarea, Form, Button, FormGroup, FormActions } from 'soapbox/components/ui';
import { captureSentryFeedback } from 'soapbox/sentry';

interface ISentryFeedbackForm {
  eventId: string;
}

/** Accept feedback for the given Sentry event. */
const SentryFeedbackForm: React.FC<ISentryFeedbackForm> = ({ eventId }) => {
  const [feedback, setFeedback] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFeedbackChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback: React.FormEventHandler = async (_e) => {
    if (!feedback || !eventId) return;
    setIsSubmitting(true);

    await captureSentryFeedback({
      event_id: eventId,
      comments: feedback,
    }).catch(console.error);

    setFeedback('');
    setIsSubmitting(false);
  };
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