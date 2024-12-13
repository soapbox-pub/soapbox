import { useCallback } from 'react';

import { cancelQuoteCompose } from 'soapbox/actions/compose.ts';
import QuotedStatus from 'soapbox/components/quoted-status.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => {
    const compose = state.compose[composeId];
    return compose ? getStatus(state, { id: compose.quote! }) : null;
  });

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
