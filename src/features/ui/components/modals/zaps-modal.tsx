import { List as ImmutableList } from 'immutable';
import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchZaps } from 'soapbox/actions/interactions';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Modal, Spinner, Text } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { shortNumberFormat } from 'soapbox/utils/numbers';

interface IAccountWithZaps {
  id: string;
  comment: string;
  amount: number;
}

interface IZapsModal {
  onClose: (string: string) => void;
  statusId: string;
}

const ZapsModal: React.FC<IZapsModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();
  const zaps = useAppSelector((state) => state.user_lists.zapped_by.get(statusId)?.items);


  const accounts = useMemo((): ImmutableList<IAccountWithZaps> | undefined => {
    if (!zaps) return;

    return zaps.map(({ account, amount, comment }) =>({ id: account, amount, comment })).flatten() as ImmutableList<IAccountWithZaps>;
  }, [zaps]);

  const fetchData = () => {
    dispatch(fetchZaps(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('ZAPS');
  };

  let body;

  if (!zaps || !accounts) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='status.zaps.empty' defaultMessage='No one has zapped this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        scrollKey='zaps'
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: '80vh' }}
        useWindowScroll={false}
      >
        {accounts.map((account, index) => {
          return (
            <div key={index}>
              <Text weight='bold'>
                {shortNumberFormat(account.amount / 1000)}
              </Text>
              <AccountContainer id={account.id} note={account.comment} emoji='⚡' />
            </div>
          );
        },
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.zaps' defaultMessage='Zaps' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default ZapsModal;
