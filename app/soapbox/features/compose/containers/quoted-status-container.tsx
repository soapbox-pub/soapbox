import React, { useCallback } from 'react';

import { cancelQuoteCompose } from 'soapbox/actions/compose';
import QuotedStatus from 'soapbox/components/quoted-status';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface IQuotedStatusContainer {
  composeId: string
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
