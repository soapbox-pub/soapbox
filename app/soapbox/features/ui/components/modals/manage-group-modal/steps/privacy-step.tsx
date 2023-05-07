import React from 'react';
import { FormattedMessage } from 'react-intl';

import { type CreateGroupParams } from 'soapbox/api/hooks';
import List, { ListItem } from 'soapbox/components/list';
import { Form, FormGroup, Stack, Text } from 'soapbox/components/ui';

interface IPrivacyStep {
  params: CreateGroupParams
  onChange(params: CreateGroupParams): void
}

const PrivacyStep: React.FC<IPrivacyStep> = ({ params, onChange }) => {
  const visibility = params.group_visibility || 'everyone';

  const onChangePrivacy = (group_visibility: CreateGroupParams['group_visibility']) => {
    onChange({ ...params, group_visibility });
  };

  return (
    <>
      <Stack className='mx-auto max-w-xs py-10' space={2}>
        <Text size='3xl' weight='bold' align='center'>
          <FormattedMessage id='manage_group.get_started' defaultMessage='Let’s get started!' />
        </Text>
        <Text theme='muted' align='center'>
          <FormattedMessage id='manage_group.tagline' defaultMessage='Groups connect you with others based on shared interests.' />
        </Text>
      </Stack>
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='manage_group.privacy.label' defaultMessage='Privacy settings' />}
        >
          <List>
            <ListItem
              label={<Text weight='medium'><FormattedMessage id='manage_group.privacy.public.label' defaultMessage='Public' /></Text>}
              hint={<FormattedMessage id='manage_group.privacy.public.hint' defaultMessage='Discoverable. Anyone can join.' />}
              onSelect={() => onChangePrivacy('everyone')}
              isSelected={visibility === 'everyone'}
            />

            <ListItem
              label={<Text weight='medium'><FormattedMessage id='manage_group.privacy.private.label' defaultMessage='Private (Owner approval required)' /></Text>}
              hint={<FormattedMessage id='manage_group.privacy.private.hint' defaultMessage='Discoverable. Users can join after their request is approved.' />}
              onSelect={() => onChangePrivacy('members_only')}
              isSelected={visibility === 'members_only'}
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
