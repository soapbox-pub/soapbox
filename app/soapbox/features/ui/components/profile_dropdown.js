import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { logOut, switchAccount } from 'soapbox/actions/auth';
import { fetchOwnAccounts } from 'soapbox/actions/auth';
import Avatar from 'soapbox/components/avatar';
import DisplayName from 'soapbox/components/display_name';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import { isStaff } from 'soapbox/utils/accounts';

import DropdownMenuContainer from '../../../containers/dropdown_menu_container';

const messages = defineMessages({
  add: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  logout: { id: 'profile_dropdown.logout', defaultMessage: 'Log out @{acct}' },
});

const mapStateToProps = state => {
  const me = state.get('me');

  return {
    account: state.getIn(['accounts', me]),
    authUsers: state.getIn(['auth', 'users']),
    isStaff: isStaff(state.getIn(['accounts', me])),
  };
};

const ProfileDropdownAccount = ({ accountId }) => {
  const getAccount = makeGetAccount();
  const account = useAppSelector(state => getAccount(state, accountId));

  return (
    <div className='account'>
      <div className='account__wrapper'>
        <div className='account__display-name'>
          <div className='account__avatar-wrapper'><Avatar account={account} size={36} /></div>
          <DisplayName account={account} />
        </div>
      </div>
    </div>
  );
};

ProfileDropdownAccount.propTypes = {
  accountId: PropTypes.string.isRequired,
};

class ProfileDropdown extends React.PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    size: PropTypes.number,
    account: ImmutablePropTypes.map,
    authUsers: ImmutablePropTypes.map,
    isStaff: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isStaff: false,
  }

  handleLogOut = e => {
    this.props.dispatch(logOut(this.props.intl));
    e.preventDefault();
  };

  handleSwitchAccount = account => {
    return e => {
      this.props.dispatch(switchAccount(account.get('id')));
      e.preventDefault();
    };
  }

  handleMiddleClick = account => {
    return e => {
      this.props.dispatch(switchAccount(account.get('id'), true));
      window.open('/', '_blank', 'noopener,noreferrer');
      e.preventDefault();
    };
  }

  fetchOwnAccounts = () => {
    this.props.dispatch(fetchOwnAccounts());
  };

  componentDidMount() {
    this.fetchOwnAccounts();
  }

  render() {
    const { intl, account, authUsers } = this.props;
    const size = this.props.size || 16;

    const menu = [];

    menu.push({ text: <ProfileDropdownAccount accountId={account.id} />, to: `/@${account.acct}` });

    authUsers.forEach(authUser => {
      if (authUser.get('id') !== account.get('id')) {
        menu.push({ text: <ProfileDropdownAccount accountId={authUser.get('id')} />, action: this.handleSwitchAccount(account), href: '/', middleClick: this.handleMiddleClick(account) });
      }
    });

    menu.push(null);

    menu.push({
      text: intl.formatMessage(messages.add),
      to: '/auth/sign_in',
      icon: require('@tabler/icons/icons/plus.svg'),
    });

    menu.push({
      text: intl.formatMessage(messages.logout, { acct: account.get('acct') }),
      to: '/auth/sign_out',
      action: this.handleLogOut,
      icon: require('@tabler/icons/icons/logout.svg'),
    });

    return (
      <div className='compose__action-bar' style={{ marginTop: '-6px' }}>
        <div className='compose__action-bar-dropdown'>
          <DropdownMenuContainer items={menu} icon='chevron-down' size={size} direction='right' />
        </div>
      </div>
    );
  }

}

export default injectIntl(connect(mapStateToProps)(ProfileDropdown));
