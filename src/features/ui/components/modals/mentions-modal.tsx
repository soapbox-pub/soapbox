import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchStatusWithContext } from '@/actions/statuses.ts';
import ScrollableList from '@/components/scrollable-list.tsx';
import Modal from '@/components/ui/modal.tsx';
import Spinner from '@/components/ui/spinner.tsx';
import AccountContainer from '@/containers/account-container.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { makeGetStatus } from '@/selectors/index.ts';

interface IMentionsModal {
  onClose: (type: string) => void;
  statusId: string;
}

const MentionsModal: React.FC<IMentionsModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector((state) => getStatus(state, { id: statusId }));
  const accountIds = status ? ImmutableOrderedSet(status.mentions.map(m => m.get('id'))) : null;

  const fetchData = () => {
    dispatch(fetchStatusWithContext(statusId));
  };

  const onClickClose = () => {
    onClose('MENTIONS');
  };

  useEffect(() => {
    fetchData();
  }, []);

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    body = (
      <ScrollableList
        scrollKey='mentions'
        listClassName='max-w-full'
        itemClassName='pb-3'
      >
        {accountIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.mentions' defaultMessage='Mentions' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default MentionsModal;
