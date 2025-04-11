import { FC } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Modal from 'soapbox/components/ui/modal.tsx';

const messages = defineMessages({
  welcomeDescription: { id: 'admin.policies.help.description', defaultMessage: 'Policy Manager allows you to configure moderation and content policies for your instance.' },
  welcomeStep1: { id: 'admin.policies.help.step1', defaultMessage: '1. Use the search bar to find policies you want to add' },
  welcomeStep2: { id: 'admin.policies.help.step2', defaultMessage: '2. Configure each policy with your desired settings' },
  welcomeStep3: { id: 'admin.policies.help.step3', defaultMessage: '3. Click Save to apply the changes' },
  welcomeTip: { id: 'admin.policies.help.tip', defaultMessage: 'Tip: You can add multiple policies to create a comprehensive moderation strategy' },
});

interface PolicyHelpModalProps {
  title: string;
  onClose: () => void;
  confirmText: string;
}

const PolicyHelpModal: FC<PolicyHelpModalProps> = ({ title, onClose, confirmText }) => {
  const intl = useIntl();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800/80'>
      <div className='w-auto max-w-2xl'>
        <Modal
          title={title}
          confirmationAction={onClose}
          confirmationText={confirmText}
          width='md'
        >
          <div className='space-y-4'>
            <p className='text-base'>
              {intl.formatMessage(messages.welcomeDescription)}
            </p>

            <div className='space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
              <p className='font-semibold'>
                {intl.formatMessage(messages.welcomeStep1)}
              </p>
              <p className='font-semibold'>
                {intl.formatMessage(messages.welcomeStep2)}
              </p>
              <p className='font-semibold'>
                {intl.formatMessage(messages.welcomeStep3)}
              </p>
            </div>

            <div className='rounded-lg bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'>
              {intl.formatMessage(messages.welcomeTip)}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default PolicyHelpModal;