import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { fetchSuggestions, dismissSuggestion } from '../../../actions/suggestions';
import { Stack, Text } from '../../../components/ui';
import AccountContainer from '../../../containers/account_container';

const messages = defineMessages({
  dismissSuggestion: { id: 'suggestions.dismiss', defaultMessage: 'Dismiss suggestion' },
});

class WhoToFollowPanel extends ImmutablePureComponent {

  static propTypes = {
    suggestions: ImmutablePropTypes.list.isRequired,
    fetchSuggestions: PropTypes.func.isRequired,
    dismissSuggestion: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.props.fetchSuggestions();
  }

  render() {
    const { intl, dismissSuggestion } = this.props;
    const suggestions = this.props.suggestions.slice(0, this.props.limit);

    if (suggestions.isEmpty()) {
      return null;
    }

    return (
      <Stack space={2}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='who_to_follow.title' defaultMessage='People To Follow' />
        </Text>

        <Stack space={3}>
          {suggestions && suggestions.map(suggestion => (
            <AccountContainer
              key={suggestion.get('account')}
              id={suggestion.get('account')}
              actionIcon={require('@tabler/icons/icons/x.svg')}
              actionTitle={intl.formatMessage(messages.dismissSuggestion)}
              onActionClick={dismissSuggestion}
            />
          ))}
        </Stack>
      </Stack>
    );
  }

}

const mapStateToProps = state => ({
  suggestions: state.getIn(['suggestions', 'items']),
});

const mapDispatchToProps = dispatch => {
  return {
    fetchSuggestions: () => dispatch(fetchSuggestions()),
    dismissSuggestion: account => dispatch(dismissSuggestion(account.get('id'))),
  };
};

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true,
  },
  )(WhoToFollowPanel));
