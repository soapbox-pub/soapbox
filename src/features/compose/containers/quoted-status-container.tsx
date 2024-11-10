import { useCallback } from 'react';

import { cancelQuoteCompose } from 'soapbox/actions/compose.ts';
import QuotedStatus from 'soapbox/components/quoted-status.tsx';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks/index.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: state.compose.get(composeId)?.quote! }));

  const onCancel = () => {
    dispatch(cancelQuoteCompose());
  };

  if (!status) {
    return null;
  }

  return (
    <div className='mb-2'>
      <QuotedStatus
        status={status}
        onCancel={onCancel}
        compose
      />
    </div>
  );
};

export default QuotedStatusContainer;
