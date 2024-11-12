import downloadIcon from '@tabler/icons/outline/download.svg';
import externalLinkIcon from '@tabler/icons/outline/external-link.svg';
import { FormattedMessage } from 'react-intl';

import { getSubscribersCsv, getUnsubscribersCsv, getCombinedCsv } from 'soapbox/actions/email-list.ts';
import { useInstanceV1 } from 'soapbox/api/hooks/instance/useInstanceV1.ts';
import List, { ListItem } from 'soapbox/components/list.tsx';
import { CardTitle } from 'soapbox/components/ui/card.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import sourceCode from 'soapbox/utils/code.ts';
import { download } from 'soapbox/utils/download.ts';
import { parseVersion } from 'soapbox/utils/features.ts';

import { DashCounter, DashCounters } from '../components/dashcounter.tsx';
import RegistrationModePicker from '../components/registration-mode-picker.tsx';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { instance } = useInstanceV1();
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

  const v = parseVersion(instance?.version ?? '0.0.0');

  const {
    user_count: userCount,
    status_count: statusCount,
    domain_count: domainCount,
  } = instance?.stats ?? {};

  const mau = instance?.pleroma.stats.mau;
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

        {features.nostr && (
          <ListItem
            to='/soapbox/admin/zap-split'
            label={<FormattedMessage id='column.admin.zap_split' defaultMessage='Manage Zap Split' />}
          />
        )}

        {features.adminAnnouncements && (
          <ListItem
            to='/soapbox/admin/announcements'
            label={<FormattedMessage id='column.admin.announcements' defaultMessage='Announcements' />}
          />
        )}

        {features.adminRules && (
          <ListItem
            to='/soapbox/admin/rules'
            label={<FormattedMessage id='column.admin.rules' defaultMessage='Instance rules' />}
          />
        )}

        {features.domains && (
          <ListItem
            to='/soapbox/admin/domains'
            label={<FormattedMessage id='column.admin.domains' defaultMessage='Domains' />}
          />
        )}

        {features.nostr && (
          <ListItem
            to='/soapbox/admin/nostr/relays'
            label={<FormattedMessage id='column.admin.nostr_relays' defaultMessage='Relays' />}
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
              className='size-4'
              src={externalLinkIcon}
            />
          </a>
        </ListItem>

        <ListItem label={<FormattedMessage id='admin.software.backend' defaultMessage='Backend' />}>
          <span>{v.software + (v.build ? `+${v.build}` : '')} {v.version}</span> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
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
                src={downloadIcon}
                onClick={handleSubscribersClick}
                iconClassName='h-5 w-5'
              />
            </ListItem>

            <ListItem label='unsubscribers.csv'>
              <IconButton
                src={downloadIcon}
                onClick={handleUnsubscribersClick}
                iconClassName='h-5 w-5'
              />
            </ListItem>

            <ListItem label='combined.csv'>
              <IconButton
                src={downloadIcon}
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
