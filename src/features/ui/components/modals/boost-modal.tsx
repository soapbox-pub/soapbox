import repeatIcon from '@tabler/icons/outline/repeat.svg';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from 'soapbox/components/icon.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { Entities, EntityTypes } from 'soapbox/entity-store/entities.ts';
import ReplyIndicator from 'soapbox/features/compose/components/reply-indicator.tsx';

import type { Status as StatusEntity } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  cancel_reblog: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
});

interface IBoostModal {
  status: StatusEntity;
  onReblog: (status: StatusEntity) => void;
  onClose: () => void;
}

const BoostModal: React.FC<IBoostModal> = ({ status, onReblog, onClose }) => {
  const intl = useIntl();

  const handleReblog = () => {
    onReblog(status);
    onClose();
  };

  const buttonText = status.reblogged ? messages.cancel_reblog : messages.reblog;

  return (
    <Modal
      title={<FormattedMessage id='boost_modal.title' defaultMessage='Repost?' />}
      confirmationAction={handleReblog}
      confirmationText={intl.formatMessage(buttonText)}
    >
      <Stack space={4}>
        <ReplyIndicator status={status.toJS() as EntityTypes[Entities.STATUSES]} hideActions />

        <Text>
          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          <FormattedMessage id='boost_modal.combo' defaultMessage='You can press {combo} to skip this next time' values={{ combo: <span>Shift + <Icon className='inline-block align-middle' src={repeatIcon} /></span> }} />
        </Text>
      </Stack>
    </Modal>
  );
};

export default BoostModal;
