import { connect } from 'react-redux';

import { cancelReplyCompose } from '@/actions/compose.ts';
import { makeGetStatus } from '@/selectors/index.ts';

import ReplyIndicator from '../components/reply-indicator.tsx';

import type { AppDispatch, RootState } from '@/store.ts';

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state: RootState, { composeId }: { composeId: string }) => {
    const statusId = state.compose[composeId]?.in_reply_to!;
    const editing = !!state.compose[composeId]?.id;

    return {
      status: getStatus(state, { id: statusId }) ?? undefined,
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
