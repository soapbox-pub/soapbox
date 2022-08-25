import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchFavourites } from 'soapbox/actions/interactions';
import { Modal, Spinner, Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account_container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

interface IFavouritesModal {
  onClose: (type: string) => void,
  statusId: string,
}

const FavouritesModal: React.FC<IFavouritesModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.favourited_by.get(statusId)?.items);

  const fetchData = () => {
    dispatch(fetchFavourites(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('FAVOURITES');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    body = (
      <Stack space={3}>
        {accountIds.size > 0 ? (
          accountIds.map((id) =>
            <AccountContainer key={id} id={id} />,
          )
        ) : (
          <FormattedMessage id='empty_column.favourites' defaultMessage='No one has liked this post yet. When someone does, they will show up here.' />
        )}
      </Stack>
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
