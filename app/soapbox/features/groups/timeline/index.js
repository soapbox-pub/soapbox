import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import StatusListContainer from '../../ui/containers/status_list_container';
import Column from '../../../components/column';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connectGroupStream } from '../../../actions/streaming';
import { expandGroupTimeline } from '../../../actions/timelines';
import MissingIndicator from '../../../components/missing_indicator';
import LoadingIndicator from '../../../components/loading_indicator';
import ComposeFormContainer from '../../../../soapbox/features/compose/containers/compose_form_container';
import Avatar from '../../../components/avatar';
import { Map as ImmutableMap } from 'immutable';
import { findGroup } from 'soapbox/utils/groups';

const mapStateToProps = (state, props) => {
  const group = findGroup(state, props.params.id);
  const id = group ? group.get('id') : '';

  const me = state.get('me');
  return {
    account: state.getIn(['accounts', me]),
    group,
    relationships: state.getIn(['group_relationships', id], ImmutableMap()),
    hasUnread: state.getIn(['timelines', `group:${id}`, 'unread']) > 0,
  };
};

export default @connect(mapStateToProps)
@injectIntl
class GroupTimeline extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    columnId: PropTypes.string,
    hasUnread: PropTypes.bool,
    group: PropTypes.oneOfType([ImmutablePropTypes.map, PropTypes.bool]),
    relationships: ImmutablePropTypes.map,
    account: ImmutablePropTypes.map,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { dispatch, group } = this.props;

    if (group) {
      dispatch(expandGroupTimeline(group.get('id')));

      // FIXME: Temporarily disabled
      this.disconnect = dispatch(connectGroupStream(group.get('id')));
    }
  }

  componentWillUnmount() {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  handleLoadMore = maxId => {
    const { group } = this.props;

    if (group) {
      this.props.dispatch(expandGroupTimeline(group.get('id'), { maxId }));
    }
  }

  render() {
    const { columnId, group, relationships, account } = this.props;

    if (group === undefined || !relationships) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    } else if (group === false) {
      return (
        <Column>
          <MissingIndicator />
        </Column>
      );
    }

    return (
      <div>
        {relationships.get('member') && (
          <div className='timeline-compose-block'>
            <div className='timeline-compose-block__avatar'>
              <Avatar account={account} size={46} />
            </div>
            <ComposeFormContainer groupId={group.get('id')} shouldCondense autoFocus={false} />
          </div>
        )}

        <div className='group__feed'>
          <StatusListContainer
            alwaysPrepend
            scrollKey={`group_timeline-${columnId}`}
            timelineId={`group:${group.get('id')}`}
            onLoadMore={this.handleLoadMore}
            group={group}
            withGroupAdmin={relationships && relationships.get('admin')}
            emptyMessage={<FormattedMessage id='empty_column.group' defaultMessage='There is nothing in this group yet. When members of this group make new posts, they will appear here.' />}
          />
        </div>
      </div>
    );
  }

}
