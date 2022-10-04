import classNames from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useSoapboxConfig } from 'soapbox/hooks';

import { Button, HStack, Text } from '../ui';

const messages = defineMessages({
  hide: { id: 'moderation_overlay.hide', defaultMessage: 'Hide' },
  title: { id: 'moderation_overlay.title', defaultMessage: 'Content Under Review' },
  subtitle: { id: 'moderation_overlay.subtitle', defaultMessage: 'This Post has been sent to Moderation for review and is only visible to you. If you believe this is an error please contact Support.' },
  contact: { id: 'moderation_overlay.contact', defaultMessage: 'Contact' },
  show: { id: 'moderation_overlay.show', defaultMessage: 'Show Content' },
});

const ModerationOverlay = () => {
  const intl = useIntl();

  const { links } = useSoapboxConfig();

  const [visible, setVisible] = useState<boolean>(false);

  const toggleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    setVisible((prevValue) => !prevValue);
  };

  return (
    <div
      className={classNames('absolute z-40', {
        'cursor-default backdrop-blur-lg rounded-lg w-full h-full border-0 flex justify-center items-center': !visible,
        'bg-gray-800/75 inset-0': !visible,
        'top-1 left-1': visible,
      })}
      data-testid='moderation-overlay'
    >
      {visible ? (
        <Button
          text={intl.formatMessage(messages.hide)}
          icon={require('@tabler/icons/eye-off.svg')}
          onClick={toggleVisibility}
          theme='transparent'
          size='sm'
        />
      ) : (
        <div className='text-center w-3/4 mx-auto space-y-4'>
          <div className='space-y-1'>
            <Text theme='white' weight='semibold'>
              {intl.formatMessage(messages.title)}
            </Text>

            <Text theme='white' size='sm' weight='medium'>
              {intl.formatMessage(messages.subtitle)}
            </Text>
          </div>

          <HStack alignItems='center' justifyContent='center' space={2}>
            {links.get('support') && (
              <a
                href={links.get('support')}
                target='_blank'
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  type='button'
                  theme='outline'
                  size='sm'
                  icon={require('@tabler/icons/headset.svg')}
                >
                  {intl.formatMessage(messages.contact)}
                </Button>
              </a>
            )}

            <Button
              type='button'
              theme='outline'
              size='sm'
              icon={require('@tabler/icons/eye.svg')}
              onClick={toggleVisibility}
            >
              {intl.formatMessage(messages.show)}
            </Button>
          </HStack>
        </div>
      )}
    </div>
  );
};

export default ModerationOverlay;