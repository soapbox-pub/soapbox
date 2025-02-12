import { useState } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import FileInput from 'soapbox/components/ui/file-input.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

interface ICSVImporter {
  messages: {
    input_label: MessageDescriptor;
    input_hint: MessageDescriptor;
    submit: MessageDescriptor;
  };
  action: (params: FormData) => (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;
}

const CSVImporter: React.FC<ICSVImporter> = ({ messages, action }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null | undefined>(null);

  const handleSubmit: React.FormEventHandler = (event) => {
    const params = new FormData();
    params.append('list', file!);

    setIsLoading(true);
    dispatch(action(params)).then(() => {
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    event.preventDefault();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.item(0);
    setFile(file);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Text size='xl' weight='bold' tag='label'>{intl.formatMessage(messages.input_label)}</Text>
      <FormGroup
        hintText={<Text theme='muted'>{intl.formatMessage(messages.input_hint)}</Text>}
      >
        <FileInput
          accept='.csv,text/csv'
          onChange={handleFileChange}
          required
        />
      </FormGroup>
      <FormActions>
        <Button type='submit' theme='primary' disabled={isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </FormActions>
    </Form>
  );
};

export default CSVImporter;
