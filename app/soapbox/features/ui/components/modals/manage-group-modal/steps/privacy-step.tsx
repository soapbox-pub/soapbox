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
      <Stack className='mx-auto max-w-sm' space={2}>
        <Text size='3xl' weight='bold' align='center'>
          <FormattedMessage id='manage_group.get_started' defaultMessage="Let's get started!" />
        </Text>
        <Text size='lg' theme='muted' align='center'>
          <FormattedMessage id='manage_group.tagline' defaultMessage='Groups connect you with others based on shared interests.' />
        </Text>
      </Stack>
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='manage_group.privacy.label' defaultMessage='Privacy settings' />}
        >
          <List>
            <ListItem
              label={<FormattedMessage id='manage_group.privacy.public.label' defaultMessage='Public' />}
              hint={<FormattedMessage id='manage_group.privacy.public.hint' defaultMessage='Discoverable. Anyone can join.' />}
              onSelect={() => onChangePrivacy(false)}
              isSelected={!locked}
            />

            <ListItem
              label={<FormattedMessage id='manage_group.privacy.private.label' defaultMessage='Private (Owner approval required)' />}
              hint={<FormattedMessage id='manage_group.privacy.private.hint' defaultMessage='Discoverable. Users can join after their request is approved.' />}
              onSelect={() => onChangePrivacy(true)}
              isSelected={locked}
            />
          </List>
        </FormGroup>
        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage id='manage_group.privacy.hint' defaultMessage='These settings cannot be changed later.' />
        </Text>
      </Form>
    </>
  );
};

export default PrivacyStep;
