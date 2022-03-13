import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { getSettings } from 'soapbox/actions/settings';
import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import Icon from 'soapbox/components/icon';
import SearchContainer from 'soapbox/features/compose/containers/search_container';
import { getFeatures } from 'soapbox/utils/features';

import { openModal } from '../../../actions/modals';
import { openSidebar } from '../../../actions/sidebar';
import Avatar from '../../../components/avatar';
import { Button } from '../../../components/ui';
// import ThemeToggle from '../../ui/components/theme_toggle_container';

import ProfileDropdown from './profile_dropdown';

// const messages = defineMessages({
//   post: { id: 'tabs_bar.post', defaultMessage: 'Post' },
// });

class TabsBar extends React.PureComponent {

  static propTypes = {
    // intl: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    // onOpenCompose: PropTypes.func,
    onOpenSidebar: PropTypes.func.isRequired,
    logo: PropTypes.string,
    account: ImmutablePropTypes.map,
    // features: PropTypes.object.isRequired,
    dashboardCount: PropTypes.number,
    notificationCount: PropTypes.number,
    chatsCount: PropTypes.number,
    singleUserMode: PropTypes.bool,
  }

  state = {
    collapsed: false,
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  setRef = ref => {
    this.node = ref;
  }

  isHomeActive = (match, location) => {
    const { pathname } = location;
    return pathname === '/' || pathname.startsWith('/timeline/');
  }

  render() {
    const { account, logo, onOpenSidebar, singleUserMode } = this.props;

    return (
      <nav className='bg-white shadow z-50 sticky top-0' ref={this.setRef}>
        <div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8'>
          <div className='relative flex justify-between h-12 lg:h-16'>
            <div className='absolute inset-y-0 left-0 flex items-center lg:hidden'>
              <button onClick={onOpenSidebar}>
                <Avatar account={account} size={34} />
              </button>
            </div>

            <div
              className={classNames({
                'flex-1 flex items-center lg:items-stretch space-x-4': true,
                'justify-center lg:justify-start': account,
                'justify-start': !account,
              })}
            >
              {logo ? (
                <Link key='logo' to='/' data-preview-title-id='column.home' className='flex-shrink-0 flex items-center'>
                  <img alt='Logo' src={logo} className='h-5 lg:h-6 w-auto lg:min-w-[160px] cursor-pointer' />
                  <span className='hidden'><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></span>
                </Link>
              ) : (
                <Link key='logo' to='/' data-preview-title-id='column.home' className='flex-shrink-0 flex items-center'>
                  <Icon alt='Logo' src={require('icons/home-square.svg')} className='h-5 lg:h-6 w-auto text-primary-700' />
                  <span className='hidden'><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></span>
                </Link>
              )}

              {account && (
                <div className='flex-1 hidden lg:flex justify-center px-2 lg:ml-6 lg:justify-start items-center'>
                  <div className='max-w-xl w-full lg:max-w-xs hidden lg:block'>
                    <SearchContainer openInRoute autosuggest />
                  </div>
                </div>
              )}
            </div>

            <div className='absolute inset-y-0 right-0 flex items-center pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0 space-x-3'>
              {account ? (
                <div className='hidden relative lg:flex items-center'>
                  <ProfileDropdown account={account}>
                    <Avatar account={account} size={34} />
                  </ProfileDropdown>
                </div>
              ) : (
                <div className='space-x-1.5'>
                  <Button theme='secondary' to='/login' size='sm'>
                    <FormattedMessage id='account.login' defaultMessage='Log In' />
                  </Button>

                  {!singleUserMode && (
                    <Button theme='primary' to='/' size='sm'>
                      <FormattedMessage id='account.register' defaultMessage='Sign up' />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

}

const mapStateToProps = state => {
  const me = state.get('me');
  const reportsCount = state.getIn(['admin', 'openReports']).count();
  const approvalCount = state.getIn(['admin', 'awaitingApproval']).count();
  const instance = state.get('instance');
  const settings = getSettings(state);
  const soapboxConfig = getSoapboxConfig(state);

  // In demo mode, use the Soapbox logo
  const logo = settings.get('demo') ? require('images/soapbox-logo.svg') : getSoapboxConfig(state).get('logo');

  return {
    account: state.getIn(['accounts', me]),
    logo,
    features: getFeatures(instance),
    notificationCount: state.getIn(['notifications', 'unread']),
    chatsCount: state.getIn(['chats', 'items']).reduce((acc, curr) => acc + Math.min(curr.get('unread', 0), 1), 0),
    dashboardCount: reportsCount + approvalCount,
    singleUserMode: soapboxConfig.get('singleUserMode'),
  };
};

const mapDispatchToProps = (dispatch) => ({
  onOpenCompose() {
    dispatch(openModal('COMPOSE'));
  },
  onOpenSidebar() {
    dispatch(openSidebar());
  },
});

export default withRouter(injectIntl(
  connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true },
  )(TabsBar)));
