import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchFavourites, expandFavourites } from '@/actions/interactions.ts';
import ScrollableList from '@/components/scrollable-list.tsx';
import Modal from '@/components/ui/modal.tsx';
import Spinner from '@/components/ui/spinner.tsx';
import AccountContainer from '@/containers/account-container.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';

interface IFavouritesModal {
  onClose: (type: string) => void;
  statusId: string;
}

const FavouritesModal: React.FC<IFavouritesModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.favourited_by.get(statusId)?.items);
  const next = useAppSelector((state) => state.user_lists.favourited_by.get(statusId)?.next);

  const fetchData = () => {
    dispatch(fetchFavourites(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('FAVOURITES');
  };

  const handleLoadMore = () => {
    if (next) {
      dispatch(expandFavourites(statusId, next!));
    }
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.favourites' defaultMessage='No one has liked this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        scrollKey='favourites'
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: '80vh' }}
        useWindowScroll={false}
        onLoadMore={handleLoadMore}
        hasMore={!!next}
      >
        {accountIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.favourites' defaultMessage='Likes' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default FavouritesModal;
