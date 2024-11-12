import dotsVerticalIcon from '@tabler/icons/outline/dots-vertical.svg';
import editIcon from '@tabler/icons/outline/edit.svg';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals.ts';
import DropdownMenu from 'soapbox/components/dropdown-menu/index.ts';
import Widget from 'soapbox/components/ui/widget.tsx';
import InstanceRestrictions from 'soapbox/features/federation-restrictions/components/instance-restrictions.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { makeGetRemoteInstance } from 'soapbox/selectors/index.ts';

const getRemoteInstance = makeGetRemoteInstance();

const messages = defineMessages({
  editFederation: { id: 'remote_instance.edit_federation', defaultMessage: 'Edit federation' },
});

interface IInstanceModerationPanel {
  /** Host (eg "gleasonator.com") of the remote instance to moderate. */
  host: string;
}

/** Widget for moderators to manage a remote instance. */
const InstanceModerationPanel: React.FC<IInstanceModerationPanel> = ({ host }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const remoteInstance = useAppSelector(state => getRemoteInstance(state, host));

  const handleEditFederation = () => {
    dispatch(openModal('EDIT_FEDERATION', { host }));
  };

  const makeMenu = () => {
    return [{
      text: intl.formatMessage(messages.editFederation),
      action: handleEditFederation,
      icon: editIcon,
    }];
  };

  const menu = makeMenu();

  return (
    <Widget
      title={<FormattedMessage id='remote_instance.federation_panel.heading' defaultMessage='Federation Restrictions' />}
      action={account?.admin ? (
        <DropdownMenu items={menu} src={dotsVerticalIcon} />
      ) : undefined}
    >
      <InstanceRestrictions remoteInstance={remoteInstance} />
    </Widget>
  );
};

export default InstanceModerationPanel;
