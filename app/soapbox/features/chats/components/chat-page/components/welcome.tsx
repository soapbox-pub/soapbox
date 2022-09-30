import React, { useState } from 'react';

import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, Stack, Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

type FormData = {
  accepting_messages?: boolean
  chats_onboarded: boolean
}

const Welcome = () => {
  const account = useOwnAccount();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepting_messages: account?.accepting_messages,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
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