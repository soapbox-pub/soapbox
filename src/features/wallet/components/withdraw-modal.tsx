import React from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from 'soapbox/components/ui/modal.tsx';
import Text from 'soapbox/components/ui/text.tsx';

interface IWithdrawModal {
  onClose: () => void;
}

const WithdrawModal: React.FC<IWithdrawModal> = ({ onClose }) => {
  return (
    <Modal
      title={<FormattedMessage id='withdraw_modal.title' defaultMessage='Feature Coming Soon!' />}
      onClose={onClose}
    >
      <Text>
        <FormattedMessage
          id='withdraw_modal.message'
          defaultMessage="The withdraw feature is not yet available, but it's coming soon! Stay tuned."
        />
      </Text>
    </Modal>
  );
};

export default WithdrawModal;