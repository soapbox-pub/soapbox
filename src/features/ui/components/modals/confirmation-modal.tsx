import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Toggle from 'soapbox/components/ui/toggle.tsx';

import type { ButtonThemes } from 'soapbox/components/ui/useButtonStyles.ts';

interface IConfirmationModal {
  heading: React.ReactNode;
  message: React.ReactNode;
  confirm: React.ReactNode;
  onClose: (type: string) => void;
  onConfirm: () => void;
  secondary: React.ReactNode;
  onSecondary?: () => void;
  onCancel: () => void;
  checkbox?: JSX.Element;
  confirmationTheme?: ButtonThemes;
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
  confirmationTheme = 'danger',
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
      confirmationTheme={confirmationTheme}
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
