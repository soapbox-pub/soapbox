import React from 'react';
import { FormattedMessage } from 'react-intl';

import { changeGroupEditorPrivacy } from 'soapbox/actions/groups';
import List, { ListItem } from 'soapbox/components/list';
import { Form, FormGroup, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const PrivacyStep = () => {
  const dispatch = useAppDispatch();

  const locked = useAppSelector((state) => state.group_editor.locked);

  const onChangePrivacy = (value: boolean) => {
    dispatch(changeGroupEditorPrivacy(value));
  };

  return (
    <>
      <Stack className='max-w-sm mx-auto' space={2}>
        <Text size='3xl' weight='bold' align='center'>
          <FormattedMessage id='manage_group.get_started' defaultMessage="Let's get started!" />
        </Text>
        <Text size='lg' theme='muted' align='center'>
          <FormattedMessage id='manage_group.tagline' defaultMessage='Groups connect you with others based on shared interests.' />
        </Text>
      </Stack>
      <Form>
        <FormGroup
          labelText='Privacy settings'
        >
          <List>
            <ListItem
              label='Public'
              hint='Discoverable. Anyone can join.'
              onSelect={() => onChangePrivacy(false)}
              isSelected={!locked}
            />

            <ListItem
              label='Private (Owner approval required)'
              hint='Discoverable. Users can join after their request is approved.'
              onSelect={() => onChangePrivacy(true)}
              isSelected={locked}
            />
          </List>
        </FormGroup>
        <Text size='sm' theme='muted' align='center'>These settings cannot be changed later.</Text>
      </Form>
    </>
  );
};

export default PrivacyStep;
