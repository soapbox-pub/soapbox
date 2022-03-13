'use strict';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

import { getSettings } from 'soapbox/actions/settings';
import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import Icon from 'soapbox/components/icon';
import { Text } from 'soapbox/components/ui';
import ComposeButton from 'soapbox/features/ui/components/compose_button';
import { getBaseURL } from 'soapbox/utils/accounts';
import { getFeatures } from 'soapbox/utils/features';

const PrimaryNavigationLink = ({ icon, text, to, count }) => {
  const isActive = location.pathname === to;
  const withCounter = typeof count !== 'undefined';

  return (
    <NavLink
      exact
      to={to}
      className={classNames({
        'flex items-center py-2 text-sm font-semibold space-x-4': true,
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': !isActive,
        'text-gray-900 dark:text-white': isActive,
      })}
    >
      <span className={classNames({
        'relative rounded-lg inline-flex p-3': true,
        'bg-primary-50 dark:bg-slate-700': !isActive,
        'bg-primary-600': isActive,
      })}
      >
        {withCounter && count > 0 ? (
          <span className='absolute -top-2 -right-2 block px-1.5 py-0.5 bg-accent-500 text-xs text-white rounded-full ring-2 ring-white'>
            {count}
          </span>
        ) : null}

        <Icon
          src={icon}
          className={classNames({
            'h-5 w-5': true,
            'text-primary-700 dark:text-white': !isActive,
            'text-white': isActive,
          })}
        />
      </span>

      <Text weight='semibold' theme='inherit'>{text}</Text>
    </NavLink>
  );
};

PrimaryNavigationLink.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  to: PropTypes.string.isRequired,
  count: PropTypes.number,
};

const mapStateToProps = state => {
  const me = state.get('me');
  const account = state.getIn(['accounts', me]);
  const reportsCount = state.getIn(['admin', 'openReports']).count();
  const approvalCount = state.getIn(['admin', 'awaitingApproval']).count();
  const instance = state.get('instance');

  return {
    account,
    logo: getSoapboxConfig(state).get('logo'),
    notificationCount: state.getIn(['notifications', 'unread']),
    chatsCount: state.getIn(['chats', 'items']).reduce((acc, curr) => acc + Math.min(curr.get('unread', 0), 1), 0),
    dashboardCount: reportsCount + approvalCount,
    baseURL: getBaseURL(account),
    settings: getSettings(state),
    features: getFeatures(instance),
    instance,
  };
};

export default @withRouter @connect(mapStateToProps)
class PrimaryNavigation extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    logo: PropTypes.string,
    account: ImmutablePropTypes.map,
    dashboardCount: PropTypes.number,
    notificationCount: PropTypes.number,
    chatsCount: PropTypes.number,
    baseURL: PropTypes.string,
    settings: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
    location: PropTypes.object,
    instance: ImmutablePropTypes.map.isRequired,
  };

  render() {
    const { account, settings, features, notificationCount, chatsCount, instance, baseURL } = this.props;

    return (
      <div>
        <div className='flex flex-col space-y-2'>
          <PrimaryNavigationLink
            to='/'
            icon={require('icons/feed.svg')}
            text={<FormattedMessage id='tabs_bar.home' defaultMessage='Feed' />}
          />

          {account && (
            <>
              <PrimaryNavigationLink
                to={`/@${account.get('acct')}`}
                icon={require('icons/user.svg')}
                text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
              />

              <PrimaryNavigationLink
                to='/notifications'
                icon={require('icons/alert.svg')}
                count={notificationCount}
                text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Alerts' />}
              />

              <PrimaryNavigationLink
                to='/settings'
                icon={require('icons/cog.svg')}
                text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
              />
            </>
          )}

          {account && (
            features.chats ? (
              <PrimaryNavigationLink
                to='/chats'
                icon={require('@tabler/icons/icons/messages.svg')}
                count={chatsCount}
                text={<FormattedMessage id='tabs_bar.chats' defaultMessage='Chats' />}
              />
            ) : (
              <PrimaryNavigationLink
                to='/messages'
                icon={require('icons/mail.svg')}
                text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
              />
            )
          )}

          {/* (account && isStaff(account)) && (
            <PrimaryNavigationLink
              to='/admin'
              icon={location.pathname.startsWith('/admin') ? require('icons/dashboard-filled.svg') : require('@tabler/icons/icons/dashboard.svg')}
              text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
              count={dashboardCount}
            />
          ) */}

          {(account && instance.get('invites_enabled')) && (
            <PrimaryNavigationLink
              to={`${baseURL}/invites`}
              icon={require('@tabler/icons/icons/mailbox.svg')}
              text={<FormattedMessage id='navigation.invites' defaultMessage='Invites' />}
            />
          )}

          {(settings.get('isDeveloper')) && (
            <PrimaryNavigationLink
              to='/developers'
              icon={require('@tabler/icons/icons/code.svg')}
              text={<FormattedMessage id='navigation.developers' defaultMessage='Developers' />}
            />
          )}

          {/* {features.federating ? (
            <NavLink to='/timeline/local' className='btn grouped'>
              <Icon
                src={require('@tabler/icons/icons/users.svg')}
                className={classNames('primary-navigation__icon', { 'svg-icon--active': location.pathname === '/timeline/local' })}
              />
              {instance.get('title')}
            </NavLink>
          ) : (
            <NavLink to='/timeline/local' className='btn grouped'>
              <Icon src={require('@tabler/icons/icons/world.svg')} className='primary-navigation__icon' />
              <FormattedMessage id='tabs_bar.all' defaultMessage='All' />
            </NavLink>
          )}

          {features.federating && (
            <NavLink to='/timeline/fediverse' className='btn grouped'>
              <Icon src={require('icons/fediverse.svg')} className='column-header__icon' />
              <FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />
            </NavLink>
          )} */}
        </div>

        {account && (
          <ComposeButton />
        )}
      </div>
    );
  }

}
