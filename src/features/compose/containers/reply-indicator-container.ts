import { connect } from 'react-redux';

import { cancelReplyCompose } from '@/actions/compose.ts';
import { Entities } from '@/entity-store/entities.ts';
import { selectEntity } from '@/entity-store/selectors.ts';
import { Status as StatusEntity } from '@/schemas/index.ts';
import { makeGetStatus } from '@/selectors/index.ts';

import ReplyIndicator from '../components/reply-indicator.tsx';

import type { AppDispatch, RootState } from '@/store.ts';
import type { Status as LegacyStatus } from '@/types/entities.ts';


const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state: RootState, { composeId }: { composeId: string }) => {
    const statusId = state.compose.get(composeId)?.in_reply_to!;
    const editing = !!state.compose.get(composeId)?.id;

    const legacyStatus = getStatus(state, { id: statusId }) as LegacyStatus;
    const statusEntity = selectEntity<StatusEntity>(state, Entities.STATUSES, statusId);

    return {
      status: (legacyStatus?.toJS() ?? statusEntity) as StatusEntity,
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
