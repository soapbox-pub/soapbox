import arrowLeftIcon from '@tabler/icons/outline/arrow-left.svg';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from 'soapbox/components/ui/modal.tsx';
import Account from 'soapbox/features/reply-mentions/account.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useCompose } from 'soapbox/hooks/useCompose.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { statusToMentionsAccountIdsArray } from 'soapbox/reducers/compose.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

interface IReplyMentionsModal {
  composeId: string;
  onClose: (string: string) => void;
}

const ReplyMentionsModal: React.FC<IReplyMentionsModal> = ({ composeId, onClose }) => {
  const compose = useCompose(composeId);

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector<StatusEntity | null>(state => getStatus(state, { id: compose.in_reply_to! }));
  const { account } = useOwnAccount();

  const mentions = statusToMentionsAccountIdsArray(status!, account!);
  const author = (status?.account as AccountEntity).id;

  const onClickClose = () => {
    onClose('REPLY_MENTIONS');
  };

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.in_reply_to' defaultMessage='In reply to' />}
      onClose={onClickClose}
      closeIcon={arrowLeftIcon}
      closePosition='left'
    >
      <div className='block min-h-[300px] flex-1 flex-row overflow-y-auto'>
        {mentions.map(accountId => <Account composeId={composeId} key={accountId} accountId={accountId} author={author === accountId} />)}
      </div>
    </Modal>
  );
};

export default ReplyMentionsModal;
