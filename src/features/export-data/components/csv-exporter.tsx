import { useState } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';

import Button from '@/components/ui/button.tsx';
import FormActions from '@/components/ui/form-actions.tsx';
import Form from '@/components/ui/form.tsx';
import Text from '@/components/ui/text.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { AppDispatch, RootState } from '@/store.ts';

interface ICSVExporter {
  messages: {
    input_label: MessageDescriptor;
    input_hint: MessageDescriptor;
    submit: MessageDescriptor;
  };
  action: () => (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;
}

const CSVExporter: React.FC<ICSVExporter> = ({ messages, action }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);

  const handleClick: React.MouseEventHandler = (event) => {
    setIsLoading(true);
    dispatch(action()).then(() => {
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  return (
    <Form>
      <Text size='xl' weight='bold'>{intl.formatMessage(messages.input_label)}</Text>
      <Text theme='muted'>{intl.formatMessage(messages.input_hint)}</Text>

      <FormActions>
        <Button theme='primary' onClick={handleClick} disabled={isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </FormActions>
    </Form>
  );
};

export default CSVExporter;
