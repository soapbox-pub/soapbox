import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';

import Modal from 'soapbox/components/ui/modal.tsx';
import Text from 'soapbox/components/ui/text.tsx';

interface IWithdrawModal {
  onClose: () => void;
}

const WithdrawModal: React.FC<IWithdrawModal> = ({ onClose }) => {
  const modalWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get the button that triggered the modal
    const buttonRef = document.querySelector('.withdraw-button') as HTMLElement;

    if (buttonRef && modalWrapperRef.current) {
      // Calculate the position of the button
      const buttonRect = buttonRef.getBoundingClientRect();

      // Position the modal relative to the button
      modalWrapperRef.current.style.position = 'absolute';
      modalWrapperRef.current.style.top = `${buttonRect.bottom + window.scrollY}px`;
      modalWrapperRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
      modalWrapperRef.current.style.zIndex = '9999';
    }
  }, []);

  // Render the modal as a portal
  return ReactDOM.createPortal(
    <div ref={modalWrapperRef}>
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
    </div>,
    document.body, // Render the modal at the root of the document
  );
};

export default WithdrawModal;