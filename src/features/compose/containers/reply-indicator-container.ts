import { connect } from 'react-redux';

import { cancelReplyCompose } from 'soapbox/actions/compose.ts';
import { Status as StatusEntity } from 'soapbox/schemas/index.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

import ReplyIndicator from '../components/reply-indicator.tsx';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { Status as LegacyStatus } from 'soapbox/types/entities.ts';


const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state: RootState, { composeId }: { composeId: string }) => {
    const statusId = state.compose[composeId]?.in_reply_to!;
    const editing = !!state.compose[composeId]?.id;

    return {
      status: (getStatus(state, { id: statusId }) as LegacyStatus)?.toJS() as StatusEntity,
      hideActions: editing,
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({

  onCancel() {
    dispatch(cancelReplyCompose());
  },

});

export default connect(makeMapStateToProps, mapDispatchToProps)(ReplyIndicator);
