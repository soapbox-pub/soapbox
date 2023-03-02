import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import SiteLogo from 'soapbox/components/site-logo';
import { Text, Button, Icon, Modal } from 'soapbox/components/ui';
import { useRegistrationStatus, useSoapboxConfig } from 'soapbox/hooks';

const messages = defineMessages({
  download: { id: 'landing_page_modal.download', defaultMessage: 'Download' },
  helpCenter: { id: 'landing_page_modal.helpCenter', defaultMessage: 'Help Center' },
  login: { id: 'header.login.label', defaultMessage: 'Log in' },
  register: { id: 'header.register.label', defaultMessage: 'Register' },
});

interface ILandingPageModal {
  onClose: (type: string) => void
}

/** Login and links to display from the hamburger menu of the homepage. */
const LandingPageModal: React.FC<ILandingPageModal> = ({ onClose }) => {
  const intl = useIntl();

  const soapboxConfig = useSoapboxConfig();
  const { isOpen } = useRegistrationStatus();
  const { links } = soapboxConfig;

  return (
    <Modal
      title={<SiteLogo alt='Logo' className='h-6 w-auto cursor-pointer' />}
      onClose={() => onClose('LANDING_PAGE')}
    >
      <div className='mt-4 divide-y divide-solid divide-gray-200 dark:divide-gray-800'>
        {links.get('help') && (
          <nav className='mb-6 grid gap-y-8'>
            <a
              href={links.get('help')}
              target='_blank'
              className='flex items-center space-x-3 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50'
            >
              <Icon src={require('@tabler/icons/lifebuoy.svg')} className='h-6 w-6 shrink-0 text-gray-600 dark:text-gray-700' />

              <Text weight='medium'>
                {intl.formatMessage(messages.helpCenter)}
              </Text>
            </a>
          </nav>
        )}

        <div
          className={clsx('grid gap-4 pt-6', {
            'grid-cols-2': isOpen,
            'grid-cols-1': !isOpen,
          })}
        >
          <Button to='/login' theme='tertiary' block>
            {intl.formatMessage(messages.login)}
          </Button>

          {isOpen && (
            <Button to='/signup' theme='primary' block>
              {intl.formatMessage(messages.register)}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LandingPageModal;
