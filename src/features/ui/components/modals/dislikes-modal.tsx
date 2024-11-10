import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchDislikes } from 'soapbox/actions/interactions.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks/index.ts';

interface IDislikesModal {
  onClose: (type: string) => void;
  statusId: string;
}

const DislikesModal: React.FC<IDislikesModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.disliked_by.get(statusId)?.items);

  const fetchData = () => {
    dispatch(fetchDislikes(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('DISLIKES');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.dislikes' defaultMessage='No one has disliked this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        scrollKey='dislikes'
        emptyMessage={emptyMessage}
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
      title={<FormattedMessage id='column.dislikes' defaultMessage='Dislikes' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default DislikesModal;
