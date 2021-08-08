import React from 'react';
import { connect } from 'react-redux';
import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { debounce } from 'lodash';
import LoadingIndicator from '../../../components/loading_indicator';
import {
  fetchMembers,
  expandMembers,
} from '../../../actions/groups';
import { FormattedMessage } from 'react-intl';
import AccountContainer from '../../../containers/account_container';
import Column from '../../ui/components/column';
import ScrollableList from '../../../components/scrollable_list';
import { findGroup } from 'soapbox/utils/groups';

const mapStateToProps = (state, props) => {
  const group = findGroup(state, props.params.id);
  const id = group ? group.get('id') : '';

  return {
    group,
    accountIds: state.getIn(['user_lists', 'groups', id, 'items']),
    hasMore: !!state.getIn(['user_lists', 'groups', id, 'next']),
  };
};

export default @connect(mapStateToProps)
class GroupMembers extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    accountIds: ImmutablePropTypes.orderedSet,
    hasMore: PropTypes.bool,
  };

  componentDidMount() {
    const { group } = this.props;

    if (group) {
      this.props.dispatch(fetchMembers(group.get('id')));
    }
  }

  componentDidUpdate(prevProps) {
    const { group } = this.props;

    if (group && group !== prevProps.group) {
      this.props.dispatch(fetchMembers(group.get('id')));
    }
  }

  handleLoadMore = debounce(() => {
    const { group } = this.props;

    this.props.dispatch(expandMembers(group.get('id')));
  }, 300, { leading: true });

  render() {
    const { accountIds, hasMore, group } = this.props;

    if (!group || !accountIds) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    return (
      <Column>
        <ScrollableList
          scrollKey='members'
          hasMore={hasMore}
          onLoadMore={this.handleLoadMore}
          emptyMessage={<FormattedMessage id='group.members.empty' defaultMessage='This group does not have any members.' />}
        >
          {accountIds.map(id => <AccountContainer key={id} id={id} withNote={false} />)}
        </ScrollableList>
      </Column>
    );
  }

}
