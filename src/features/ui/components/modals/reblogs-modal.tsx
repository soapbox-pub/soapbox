import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchReblogs, expandReblogs } from 'soapbox/actions/interactions.ts';
import { fetchStatus } from 'soapbox/actions/statuses.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

interface IReblogsModal {
  onClose: (string: string) => void;
  statusId: string;
}

const ReblogsModal: React.FC<IReblogsModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();
  const accountIds = useAppSelector((state) => state.user_lists.reblogged_by.get(statusId)?.items);
  const next = useAppSelector((state) => state.user_lists.reblogged_by.get(statusId)?.next);

  const fetchData = () => {
    dispatch(fetchReblogs(statusId));
    dispatch(fetchStatus(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('REBLOGS');
  };

  const handleLoadMore = () => {
    if (next) {
      dispatch(expandReblogs(statusId, next!));
    }
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='status.reblogs.empty' defaultMessage='No one has reposted this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        scrollKey='reblogs'
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: '80vh' }}
        useWindowScroll={false}
        onLoadMore={handleLoadMore}
        hasMore={!!next}
      >
        {accountIds.map((id) =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.reblogs' defaultMessage='Reposts' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default ReblogsModal;
