import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import React, { useEffect } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { fetchHistory } from 'soapbox/actions/history';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs';
import { HStack, Modal, Spinner, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import type { StatusEdit as StatusEditEntity } from 'soapbox/types/entities';

interface ICompareHistoryModal {
  onClose: (string: string) => void
  statusId: string
}

const CompareHistoryModal: React.FC<ICompareHistoryModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(state => state.history.getIn([statusId, 'loading']));
  // @ts-ignore
  const versions = useAppSelector<ImmutableList<StatusEditEntity>>(state => state.history.getIn([statusId, 'items']));

  const onClickClose = () => {
    onClose('COMPARE_HISTORY');
  };

  useEffect(() => {
    dispatch(fetchHistory(statusId));
  }, [statusId]);

  let body;

  if (loading) {
    body = <Spinner />;
  } else {
    body = (
      <div className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'>
        {versions?.map((version) => {
          const content = { __html: version.contentHtml };
          const spoilerContent = { __html: version.spoilerHtml };

          const poll = typeof version.poll !== 'string' && version.poll;

          return (
            <div className='flex flex-col py-2 first:pt-0 last:pb-0'>
              {version.spoiler_text?.length > 0 && (
                <>
                  <span dangerouslySetInnerHTML={spoilerContent} />
                  <hr />
                </>
              )}

              <div className='status__content' dangerouslySetInnerHTML={content} />

              {poll && (
                <div className='poll'>
                  <Stack>
                    {version.poll.options.map((option: any) => (
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

              {version.media_attachments.size > 0 && (
                <AttachmentThumbs media={version.media_attachments} />
              )}

              <Text align='right' tag='span' theme='muted' size='sm'>
                <FormattedDate value={new Date(version.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
              </Text>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='compare_history_modal.header' defaultMessage='Edit history' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default CompareHistoryModal;
