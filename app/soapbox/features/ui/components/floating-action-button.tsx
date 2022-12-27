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
        'p-4 inline-flex items-center border font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none transition-all',
        'bg-primary-500 hover:bg-primary-400 dark:hover:bg-primary-600 border-transparent focus:bg-primary-500 text-gray-100 focus:ring-primary-300',
      )}
      aria-label={intl.formatMessage(messages.publish)}
    >
      <Icon
        src={require('@tabler/icons/pencil-plus.svg')}
        className='w-6 h-6'
      />
    </button>
  );
};

export default FloatingActionButton;