import clsx from 'clsx';
import React from 'react';
import { HotKeys } from 'react-hotkeys';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import Markup from 'soapbox/components/markup';
import StatusInfo from 'soapbox/components/statuses/status-info';
import { Card, HStack, Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import Bundle from 'soapbox/features/ui/components/bundle';
import { MediaGallery } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch } from 'soapbox/hooks';
import { isRtl } from 'soapbox/rtl';

import type { List as ImmutableList } from 'immutable';
import type { Account as AccountEntity, Attachment as AttachmentEntity, StatusEdit as StatusEditEntity } from 'soapbox/types/entities';

interface IStatusEdit {
  status: StatusEditEntity
  latestVersion?: boolean
}

const StatusEdit: React.FC<IStatusEdit> = ({ status, latestVersion }) => {
  const dispatch = useAppDispatch();
  const account = status.account as AccountEntity;

  const handlers = {};

  const poll = typeof status.poll !== 'string' && status.poll;
  const content = { __html: status.contentHtml };
  const spoilerContent = { __html: status.spoilerHtml };
  const direction = isRtl(status.contentHtml) ? 'rtl' : 'ltr';

  const openMedia = (media: ImmutableList<AttachmentEntity>, index: number) => {
    dispatch(openModal('MEDIA', { media, index }));
  };

  return (
    <HotKeys handlers={handlers} data-testid='status'>
      <div
        className='status focusable'
        tabIndex={0}
        role='link'
      >
        <Card variant='rounded' className='status__wrapper space-y-4 py-6 sm:p-5'>
          {latestVersion && (
            <StatusInfo
              avatarSize={42}
              text={<FormattedMessage id='status_edit.recent_version' defaultMessage='Latest version' />
              }
            />
          )}

          <AccountContainer
            key={account.id}
            id={account.id}
            timestamp={status.created_at}
            hideActions
            showProfileHoverCard
            withLinkToProfile
          />

          <div className='status__content-wrapper'>

            {status.spoiler_text?.length > 0 && (
              <>
                <span dangerouslySetInnerHTML={spoilerContent} />
                <hr />
              </>
            )}

            <Stack space={4}>
              <Markup
                tabIndex={0}
                className='relative overflow-hidden text-ellipsis break-words text-gray-900 focus:outline-none dark:text-gray-100'
                direction={direction}
                dangerouslySetInnerHTML={content}
                size='md'
              />

              {poll && (
                <div className='poll'>
                  <Stack>
                    {poll.options.map((option: any) => (
                      <HStack alignItems='center' className='p-1 text-gray-900 dark:text-gray-300'>
                        <span
                          className={clsx('mr-2.5 inline-block h-4 w-4 flex-none rounded-full border border-solid border-primary-600', {
                            'rounded': poll.multiple,
                          })}
                          tabIndex={0}
                          role={poll.multiple ? 'checkbox' : 'radio'}
                        />

                        <span dangerouslySetInnerHTML={{ __html: option.title_emojified }} />
                      </HStack>
                    ))}
                  </Stack>
                </div>
              )}

              {(status.media_attachments.size > 0) && (
                <Stack space={4}>
                  <Bundle fetchComponent={MediaGallery} loading={() => <div className='media_gallery' style={{ height: '285px' }} />}>
                    {(Component: any) => (
                      <Component
                        media={status.media_attachments}
                        sensitive={status.sensitive}
                        height={285}
                        onOpenMedia={openMedia}
                        visible
                      />
                    )}
                  </Bundle>
                </Stack>
              )}
            </Stack>
          </div>
        </Card>
      </div >
    </HotKeys>
  );
};

export default StatusEdit;
