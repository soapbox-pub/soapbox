import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';

import { patchMeSuccess } from 'soapbox/actions/me';
import snackbar from 'soapbox/actions/snackbar';
import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, Stack, Toggle } from 'soapbox/components/ui';
import { useApi, useAppDispatch, useOwnAccount } from 'soapbox/hooks';

type FormData = {
  accepting_messages?: boolean
  chats_onboarded: boolean
}

const Welcome = () => {
  const account = useOwnAccount();
  const api = useApi();
  const dispatch = useAppDispatch();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepting_messages: account?.accepting_messages,
  });

  const updateSettings = useMutation(() => api.patch('/api/v1/accounts/update_credentials', data), {
    onSuccess(response) {
      dispatch(patchMeSuccess(response.data));
      dispatch(snackbar.success('Chat Settings updated successfully'));
    },
    onError() {
      dispatch(snackbar.success('Chat Settings failed to update.'));
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateSettings.mutate();
  };

  return (
    <Stack className='h-full p-6 space-y-8'>
      <CardTitle title='Message Settings' />

      <Form onSubmit={handleSubmit}>
        <CardTitle title='Privacy' />

        <CardBody>
          <List>
            <ListItem
              label='Allow others to message me'
              hint='Only people I follow can send me messages'
            >
              <Toggle
                checked={data.accepting_messages}
                onChange={(event) => setData((prevData) => ({ ...prevData, accepting_messages: event.target.checked }))}
              />
            </ListItem>
          </List>
        </CardBody>

        <Button type='submit' theme='primary'>
          Save & Continue
        </Button>
      </Form>
    </Stack>
  );
};

export default Welcome;