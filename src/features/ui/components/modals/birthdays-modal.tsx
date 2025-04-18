import { FormattedMessage } from 'react-intl';

import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Account from 'soapbox/features/birthdays/account.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

interface IBirthdaysModal {
  onClose: (string: string) => void;
}

const BirthdaysModal = ({ onClose }: IBirthdaysModal) => {
  const accountIds = useAppSelector(state => state.user_lists.birthday_reminders.get(state.me as string)?.items);

  const onClickClose = () => {
    onClose('BIRTHDAYS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='birthdays_modal.empty' defaultMessage='None of your friends have birthday today.' />;

    body = (
      <ScrollableList
        scrollKey='birthdays'
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
      >
        {accountIds.map(id =>
          <Account key={id} accountId={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.birthdays' defaultMessage='Birthdays' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default BirthdaysModal;
