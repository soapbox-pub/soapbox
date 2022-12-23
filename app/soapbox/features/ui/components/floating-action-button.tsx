import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { Icon } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

const messages = defineMessages({
  publish: { id: 'compose_form.publish', defaultMessage: 'Publish' },
});

interface IFloatingActionButton {
}

/** FloatingActionButton (aka FAB), a composer button that floats in the corner on mobile. */
const FloatingActionButton: React.FC<IFloatingActionButton> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleOpenComposeModal = () => {
    dispatch(openModal('COMPOSE'));
  };

  return (
    <button
      onClick={handleOpenComposeModal}
      className='z-40 lg:hidden transition-all fixed bottom-24 right-4 p-4 text-white bg-accent-300 hover:bg-accent-500 rounded-full'
      aria-label={intl.formatMessage(messages.publish)}
    >
      <Icon
        src={require('@tabler/icons/pencil-plus.svg')}
        className='w-6 h-6 stroke-[1.5px]'
      />
    </button>
  );
};

export default FloatingActionButton;