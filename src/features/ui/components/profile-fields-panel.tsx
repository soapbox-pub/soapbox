import { FormattedMessage } from 'react-intl';

import { Widget, Stack } from 'soapbox/components/ui/index.ts';

import ProfileField from './profile-field.tsx';

import type { Account } from 'soapbox/schemas/index.ts';

interface IProfileFieldsPanel {
  account: Account;
}

/** Custom profile fields for sidebar. */
const ProfileFieldsPanel: React.FC<IProfileFieldsPanel> = ({ account }) => {
  return (
    <Widget title={<FormattedMessage id='profile_fields_panel.title' defaultMessage='Profile fields' />}>
      <Stack space={4}>
        {account.fields.map((field, i) => (
          <ProfileField field={field} key={i} />
        ))}
      </Stack>
    </Widget>
  );
};

export default ProfileFieldsPanel;
