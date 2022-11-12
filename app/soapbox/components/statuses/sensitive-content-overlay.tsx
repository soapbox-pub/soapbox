import classNames from 'clsx';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useSettings, useSoapboxConfig } from 'soapbox/hooks';
import { defaultMediaVisibility } from 'soapbox/utils/status';

import { Button, HStack, Text } from '../ui';

import type { Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  hide: { id: 'moderation_overlay.hide', defaultMessage: 'Hide content' },
  sensitiveTitle: { id: 'status.sensitive_warning', defaultMessage: 'Sensitive content' },
  underReviewTitle: { id: 'moderation_overlay.title', defaultMessage: 'Content Under Review' },
  underReviewSubtitle: { id: 'moderation_overlay.subtitle', defaultMessage: 'This Post has been sent to Moderation for review and is only visible to you. If you believe this is an error please contact Support.' },
  sensitiveSubtitle: { id: 'status.sensitive_warning.subtitle', defaultMessage: 'This content may not be suitable for all audiences.' },
  contact: { id: 'moderation_overlay.contact', defaultMessage: 'Contact' },
  show: { id: 'moderation_overlay.show', defaultMessage: 'Show Content' },
});

interface ISensitiveContentOverlay {
  status: StatusEntity
  onToggleVisibility?(): void
  visible?: boolean
}

const SensitiveContentOverlay = (props: ISensitiveContentOverlay) => {
  const { onToggleVisibility, status } = props;
  const isUnderReview = status.visibility === 'self';

  const settings = useSettings();
  const displayMedia = settings.get('displayMedia') as string;

  const intl = useIntl();

  const { links } = useSoapboxConfig();

  const [visible, setVisible] = useState<boolean>(defaultMediaVisibility(status, displayMedia));

  const toggleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (onToggleVisibility) {
      onToggleVisibility();
    } else {
      setVisible((prevValue) => !prevValue);
    }
  };

  useEffect(() => {
    if (typeof props.visible !== 'undefined') {
      setVisible(!!props.visible);
    }
  }, [props.visible]);

  return (
    <div
      className={classNames('absolute z-40', {
        'cursor-default backdrop-blur-lg rounded-lg w-full h-full border-0 flex justify-center items-center': !visible,
        'bg-gray-800/75 inset-0': !visible,
        'bottom-1 right-1': visible,
      })}
      data-testid='sensitive-overlay'
    >
      {visible ? (
        <Button
          text={intl.formatMessage(messages.hide)}
          icon={require('@tabler/icons/eye-off.svg')}
          onClick={toggleVisibility}
          theme='primary'
          size='sm'
        />
      ) : (
        <div className='text-center w-3/4 mx-auto space-y-4'>
          <div className='space-y-1'>
            <Text theme='white' weight='semibold'>
              {intl.formatMessage(isUnderReview ? messages.underReviewTitle : messages.sensitiveTitle)}
            </Text>

            <Text theme='white' size='sm' weight='medium'>
              {intl.formatMessage(isUnderReview ? messages.underReviewSubtitle : messages.sensitiveSubtitle)}
            </Text>

            {status.spoiler_text && (
              <div className='py-4 italic'>
                <Text theme='white' size='md' weight='medium'>
                  &ldquo;<span dangerouslySetInnerHTML={{ __html: status.spoilerHtml }} />&rdquo;
                </Text>
              </div>
            )}
          </div>

          <HStack alignItems='center' justifyContent='center' space={2}>
            {isUnderReview ? (
              <>
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
              </>
            ) : null}

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

export default SensitiveContentOverlay;