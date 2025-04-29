import { List as ImmutableList } from 'immutable';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';


import { fetchZaps, expandZaps } from 'soapbox/actions/interactions.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useWalletStore, useZappedByCashu } from 'soapbox/features/wallet/hooks/useHooks.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

interface IAccountWithZaps {
  id: string;
  comment: string;
  amount: number;
  type: string;
}

interface IZapsModal {
  onClose: (string: string) => void;
  statusId: string;
}

const ZapsModal: React.FC<IZapsModal> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const zaps = useAppSelector((state) => state.user_lists.zapped_by.get(statusId)?.items);
  const next = useAppSelector((state) => state.user_lists.zapped_by.get(statusId)?.next);
  const nutzaps = useWalletStore().nutzappedRecord[statusId];
  const { nextZaps } = useWalletStore();
  const { getNutzappedBy, expandNutzappedBy } = useZappedByCashu(statusId);

  const accounts = useMemo((): ImmutableList<IAccountWithZaps> | undefined => {
    if (!zaps && !nutzaps) return;

    const zappedAccounts = zaps?.map(({ account, amount, comment }) => ({ id: account, amount, comment, type: 'zap' })) || [];
    const nutzappedAccounts = nutzaps?.map(({ account, amount, comment }) => ({ id: account.id, amount, comment, type: 'nutzap' })) || [];

    const combinedAccounts = [...zappedAccounts, ...nutzappedAccounts];

    return ImmutableList(combinedAccounts);
  }, [zaps, nutzaps]);

  const fetchData = () => {
    dispatch(fetchZaps(statusId));
  };

  useEffect(() => {
    fetchData();
    getNutzappedBy();
  }, []);

  const onClickClose = () => {
    onClose('ZAPS');
  };

  const handleLoadMore = () => {
    if (next) {
      dispatch(expandZaps(statusId, next));
    }
    if (nextZaps) {
      expandNutzappedBy();
    }
  };

  let body;

  if (!zaps || !nutzaps || !accounts) {
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
        onLoadMore={handleLoadMore}
        hasMore={!!next || !!nextZaps}
      >
        {accounts.map((account, index) => {
          return (
            <div key={index}>
              <Text weight='bold'>
                {account.type === 'zap' ? shortNumberFormat(account.amount / 1000) : shortNumberFormat(account.amount)}
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
