import React from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from 'soapbox/components/ui/modal.tsx';
import Text from 'soapbox/components/ui/text.tsx';

interface IStreakModal {
  onClose: () => void;
}

const StreakModal: React.FC<IStreakModal> = ({ onClose }) => {

  return (
    <Modal title={<FormattedMessage id='streak_modal.title' defaultMessage="You've started a new streak!" />} onClose={onClose}>
      <Text>
        <FormattedMessage id='streak_modal.message' defaultMessage='Post every day to keep it going!' />
      </Text>
    </Modal>
  );
};

export default StreakModal;