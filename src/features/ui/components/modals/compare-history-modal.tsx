import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import { useEffect } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { fetchHistory } from 'soapbox/actions/history.ts';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { Attachment } from 'soapbox/schemas/index.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';

import type { StatusEdit as StatusEditEntity } from 'soapbox/types/entities.ts';

interface ICompareHistoryModal {
  onClose: (string: string) => void;
  statusId: string;
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
          const poll = typeof version.poll !== 'string' && version.poll;

          return (
            <div className='flex flex-col py-2 first:pt-0 last:pb-0'>
              {version.spoiler_text?.length > 0 && (
                <>
                  <span>{emojifyText(version.spoiler_text, version.emojis.toJS())}</span>
                  <hr />
                </>
              )}

              <div
                className='whitespace-normal p-0 pt-2.5 text-sm text-gray-700 dark:text-gray-500'
                dangerouslySetInnerHTML={{ __html: version.content }}
              />

              {poll && (
                <div>
                  <Stack>
                    {version.poll.options.map((option) => (
                      <HStack alignItems='center' className='p-1 text-gray-900 dark:text-gray-300'>
                        <span
                          className={clsx('mr-2.5 inline-block size-4 flex-none rounded-full border border-solid border-primary-600', {
                            'rounded': poll.multiple,
                          })}
                          tabIndex={0}
                          role={poll.multiple ? 'checkbox' : 'radio'}
                        />

                        <span>{emojifyText(option.title, poll.emojis)}</span>
                      </HStack>
                    ))}
                  </Stack>
                </div>
              )}

              {version.media_attachments.length > 0 && (
                <AttachmentThumbs media={version.media_attachments as unknown as Attachment[]} />
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
