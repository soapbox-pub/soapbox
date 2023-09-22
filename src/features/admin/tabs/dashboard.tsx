import React from 'react';
import { FormattedMessage } from 'react-intl';

import { getSubscribersCsv, getUnsubscribersCsv, getCombinedCsv } from 'soapbox/actions/email-list';
import List, { ListItem } from 'soapbox/components/list';
import { CardTitle, Icon, IconButton, Stack } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount, useFeatures, useInstance } from 'soapbox/hooks';
import sourceCode from 'soapbox/utils/code';
import { download } from 'soapbox/utils/download';
import { parseVersion } from 'soapbox/utils/features';

import { DashCounter, DashCounters } from '../components/dashcounter';
import RegistrationModePicker from '../components/registration-mode-picker';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const features = useFeatures();
  const { account } = useOwnAccount();

  const handleSubscribersClick: React.MouseEventHandler = e => {
    dispatch(getSubscribersCsv()).then(({ data }) => {
      download(data, 'subscribers.csv');
    }).catch(() => {});
    e.preventDefault();
  };

  const handleUnsubscribersClick: React.MouseEventHandler = e => {
    dispatch(getUnsubscribersCsv()).then(({ data }) => {
      download(data, 'unsubscribers.csv');
    }).catch(() => {});
    e.preventDefault();
  };

  const handleCombinedClick: React.MouseEventHandler = e => {
    dispatch(getCombinedCsv()).then(({ data }) => {
      download(data, 'combined.csv');
    }).catch(() => {});
    e.preventDefault();
  };

  const v = parseVersion(instance.version);

  const userCount   = instance.stats.get('user_count');
  const statusCount = instance.stats.get('status_count');
  const domainCount = instance.stats.get('domain_count');

  const mau = instance.pleroma.getIn(['stats', 'mau']) as number | undefined;
  const retention = (userCount && mau) ? Math.round(mau / userCount * 100) : undefined;

  if (!account) return null;

  return (
    <Stack space={6} className='mt-4'>
      <DashCounters>
        <DashCounter
          count={mau}
          label={<FormattedMessage id='admin.dashcounters.mau_label' defaultMessage='monthly active users' />}
        />
        <DashCounter
          to='/soapbox/admin/users'
          count={userCount}
          label={<FormattedMessage id='admin.dashcounters.user_count_label' defaultMessage='total users' />}
        />
        <DashCounter
          count={retention}
          label={<FormattedMessage id='admin.dashcounters.retention_label' defaultMessage='user retention' />}
          percent
        />
        <DashCounter
          to='/timeline/local'
          count={statusCount}
          label={<FormattedMessage id='admin.dashcounters.status_count_label' defaultMessage='posts' />}
        />
        <DashCounter
          count={domainCount}
          label={<FormattedMessage id='admin.dashcounters.domain_count_label' defaultMessage='peers' />}
        />
      </DashCounters>

      <List>
        {account.admin && (
          <ListItem
            to='/soapbox/config'
            label={<FormattedMessage id='navigation_bar.soapbox_config' defaultMessage='Soapbox config' />}
          />
        )}

        <ListItem
          to='/soapbox/admin/log'
          label={<FormattedMessage id='column.admin.moderation_log' defaultMessage='Moderation Log' />}
        />

        {features.announcements && (
          <ListItem
            to='/soapbox/admin/announcements'
            label={<FormattedMessage id='column.admin.announcements' defaultMessage='Announcements' />}
          />
        )}
      </List>

      {account.admin && (
        <>
          <CardTitle
            title={<FormattedMessage id='admin.dashboard.registration_mode_label' defaultMessage='Registrations' />}
          />

          <RegistrationModePicker />
        </>
      )}

      <CardTitle
        title={<FormattedMessage id='admin.dashwidgets.software_header' defaultMessage='Software' />}
      />

      <List>
        <ListItem label={<FormattedMessage id='admin.software.frontend' defaultMessage='Frontend' />}>
          <a
            href={sourceCode.ref ? `${sourceCode.url}/tree/${sourceCode.ref}` : sourceCode.url}
            className='flex items-center space-x-1 truncate'
            target='_blank'
          >
            <span>{sourceCode.displayName} {sourceCode.version}</span>

            <Icon
              className='h-4 w-4'
              src={require('@tabler/icons/external-link.svg')}
            />
          </a>
        </ListItem>

        <ListItem label={<FormattedMessage id='admin.software.backend' defaultMessage='Backend' />}>
          <span>{v.software + (v.build ? `+${v.build}` : '')} {v.version}</span>
        </ListItem>
      </List>

      {(features.emailList && account.admin) && (
        <>
          <CardTitle
            title={<FormattedMessage id='admin.dashwidgets.email_list_header' defaultMessage='Email list' />}
          />

          <List>
            <ListItem label='subscribers.csv'>
              <IconButton
                src={require('@tabler/icons/download.svg')}
                onClick={handleSubscribersClick}
                iconClassName='h-5 w-5'
              />
            </ListItem>

            <ListItem label='unsubscribers.csv'>
              <IconButton
                src={require('@tabler/icons/download.svg')}
                onClick={handleUnsubscribersClick}
                iconClassName='h-5 w-5'
              />
            </ListItem>

            <ListItem label='combined.csv'>
              <IconButton
                src={require('@tabler/icons/download.svg')}
                onClick={handleCombinedClick}
                iconClassName='h-5 w-5'
              />
            </ListItem>
          </List>
        </>
      )}
    </Stack>
  );
};

export default Dashboard;
