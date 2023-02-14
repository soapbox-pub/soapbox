import clsx from 'clsx';
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
      className={clsx(
        'inline-flex appearance-none items-center rounded-full border p-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
        'border-transparent bg-secondary-500 text-gray-100 hover:bg-secondary-400 focus:bg-secondary-500 focus:ring-secondary-300',
      )}
      aria-label={intl.formatMessage(messages.publish)}
    >
      <Icon
        src={require('@tabler/icons/pencil-plus.svg')}
        className='h-6 w-6'
      />
    </button>
  );
};

export default FloatingActionButton;
