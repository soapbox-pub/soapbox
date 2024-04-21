import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { toggleStatusHidden } from 'soapbox/actions/statuses';
import { useAppDispatch, useSettings } from 'soapbox/hooks';

import { Button, HStack, Text } from '../ui';

import type { Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  hide: { id: 'moderation_overlay.hide', defaultMessage: 'Hide content' },
  sensitiveTitle: { id: 'status.sensitive_warning', defaultMessage: 'Sensitive content' },
  sensitiveSubtitle: { id: 'status.sensitive_warning.subtitle', defaultMessage: 'This content may not be suitable for all audiences.' },
  show: { id: 'moderation_overlay.show', defaultMessage: 'Show Content' },
});

interface ISensitiveContentOverlay {
  status: StatusEntity;
}

const SensitiveContentOverlay = React.forwardRef<HTMLDivElement, ISensitiveContentOverlay>((props, ref) => {
  const { status } = props;

  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { displayMedia, expandSpoilers } = useSettings();

  let visible = false;

  if (status.hidden !== null) {
    visible = status.hidden;
  } else {
    if (expandSpoilers) visible = true;
    if ((displayMedia === 'default' && status.sensitive) || displayMedia === 'hide_all') visible = false;
  }

  const toggleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    dispatch(toggleStatusHidden(status));
  };

  return (
    <div
      className={clsx('absolute z-40', {
        'cursor-default backdrop-blur-lg rounded-lg w-full h-full border-0 flex justify-center': !visible,
        'bg-gray-800/75 inset-0': !visible,
        'bottom-1 right-1': visible,
      })}
      data-testid='sensitive-overlay'
    >
      {visible ? (
        <Button
          text={intl.formatMessage(messages.hide)}
          icon={require('@tabler/icons/outline/eye-off.svg')}
          onClick={toggleVisibility}
          theme='primary'
          size='sm'
        />
      ) : (
        <div className='flex max-h-screen items-center justify-center'>
          <div className='mx-auto w-3/4 space-y-4 text-center' ref={ref}>
            <div className='space-y-1'>
              <Text theme='white' weight='semibold'>
                {intl.formatMessage(messages.sensitiveTitle)}
              </Text>

              <Text theme='white' size='sm' weight='medium'>
                {intl.formatMessage(messages.sensitiveSubtitle)}
              </Text>

              {status.spoiler_text && (
                <div className='py-4 italic'>
                  <Text className='line-clamp-6' theme='white' size='md' weight='medium'>
                    &ldquo;<span dangerouslySetInnerHTML={{ __html: status.spoilerHtml }} />&rdquo;
                  </Text>
                </div>
              )}
            </div>

            <HStack alignItems='center' justifyContent='center' space={2}>
              <Button
                type='button'
                theme='outline'
                size='sm'
                icon={require('@tabler/icons/outline/eye.svg')}
                onClick={toggleVisibility}
              >
                {intl.formatMessage(messages.show)}
              </Button>
            </HStack>
          </div>
        </div>
      )}
    </div>
  );
});

export default SensitiveContentOverlay;
