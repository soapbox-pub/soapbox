import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { openComposeWithText } from 'soapbox/actions/compose';
import { Button } from 'soapbox/components/ui';
import emojify from 'soapbox/features/emoji/emoji';

const buildWelcomeMessage = account => (
  `Welcome, @${account.acct}`
);

const messages = defineMessages({
  welcome: { id: 'account.welcome', defaultMessage: 'Welcome' },
});

const mapDispatchToProps = (dispatch) => ({
  onClick(account) {
    const text = buildWelcomeMessage(account);
    dispatch(openComposeWithText(text));
  },
});

export default @connect(undefined, mapDispatchToProps)
@injectIntl
class WelcomeButton extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    account: ImmutablePropTypes.map.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  handleClick = () => {
    this.props.onClick(this.props.account);
  }

  render() {
    const { intl } = this.props;

    return (
      <Button className='logo-button button--welcome' onClick={this.handleClick}>
        <div dangerouslySetInnerHTML={{ __html: emojify('👋') }} />
        {intl.formatMessage(messages.welcome)}
      </Button>
    );
  }

}
