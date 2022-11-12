import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Modal, Stack, Text, Toggle } from 'soapbox/components/ui';

interface IConfirmationModal {
  heading: React.ReactNode,
  message: React.ReactNode,
  confirm: React.ReactNode,
  onClose: (type: string) => void,
  onConfirm: () => void,
  secondary: React.ReactNode,
  onSecondary?: () => void,
  onCancel: () => void,
  checkbox?: JSX.Element,
}

const ConfirmationModal: React.FC<IConfirmationModal> = ({
  heading,
  message,
  confirm,
  onClose,
  onConfirm,
  secondary,
  onSecondary,
  onCancel,
  checkbox,
}) => {
  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    onClose('CONFIRM');
    onConfirm();
  };

  const handleSecondary = () => {
    onClose('CONFIRM');
    onSecondary!();
  };

  const handleCancel = () => {
    onClose('CONFIRM');
    if (onCancel) onCancel();
  };

  const handleCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setChecked(e.target.checked);
  };

  return (
    <Modal
      title={heading}
      confirmationAction={handleClick}
      confirmationText={confirm}
      confirmationDisabled={checkbox && !checked}
      confirmationTheme='danger'
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
      secondaryText={secondary}
      secondaryAction={onSecondary && handleSecondary}
    >
      <Stack space={4}>
        <Text>
          {message}
        </Text>

        {checkbox && (
          <List>
            <ListItem label={checkbox}>
              <Toggle
                checked={checked}
                onChange={handleCheckboxChange}
                required
              />
            </ListItem>
          </List>
        )}
      </Stack>
    </Modal>
  );
};

export default ConfirmationModal;
