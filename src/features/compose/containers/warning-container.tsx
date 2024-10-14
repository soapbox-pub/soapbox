import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { useAppSelector, useCompose, useOwnAccount, useSettingsNotifications } from 'soapbox/hooks';
import { selectOwnAccount } from 'soapbox/selectors';

import Warning from '../components/warning';

const APPROX_HASHTAG_RE = /(?:^|[^/)\w])#(\w*[a-zA-Z·]\w*)/i;

interface IWarningWrapper {
  composeId: string;
}

const WarningWrapper: React.FC<IWarningWrapper> = ({ composeId }) => {
  const compose = useCompose(composeId);
  const scheduledStatusCount = useAppSelector((state) => state.scheduled_statuses.size);
  const { account } = useOwnAccount();
  const settingsNotifications = useSettingsNotifications();

  const needsLockWarning = useAppSelector((state) => compose.privacy === 'private' && !selectOwnAccount(state)!.locked);
  const hashtagWarning = (compose.privacy !== 'public' && compose.privacy !== 'group') && APPROX_HASHTAG_RE.test(compose.text);
  const directMessageWarning = compose.privacy === 'direct';

  if (scheduledStatusCount > 0) {
    return (
      <Warning
        message={(
          <FormattedMessage
            id='compose_form.scheduled_statuses.message'
            defaultMessage='You have scheduled posts. {click_here} to see them.'
            values={{ click_here: (
              <Link to='/scheduled_statuses'>
                <FormattedMessage
                  id='compose_form.scheduled_statuses.click_here'
                  defaultMessage='Click here'
                />
              </Link>
            ) }}
          />)
        }
      />
    );
  }

  if (account?.source?.nostr?.nip05 === undefined) {
    if (settingsNotifications.has('needsNip05')) {
      return (
        <FormattedMessage
          id='compose_form.nip05.warning'
          defaultMessage={'You don\'t have a username configured. {click} to set one up.'}
          values={{
            click: (
              <Link to='/settings/identity'>
                <FormattedMessage id='compose_form.nip05.warning.click' defaultMessage='Click here' />
              </Link>
            ),
          }}
        />
      );
    } else {
      return (
        <FormattedMessage
          id='compose_form.nip05.pending'
          defaultMessage='Your username request is under review.'
        />
      );
    }
  }

  if (needsLockWarning) {
    return (
      <Warning
        message={(
          <FormattedMessage
            id='compose_form.lock_disclaimer'
            defaultMessage='Your account is not {locked}. Anyone can follow you to view your follower-only posts.'
            values={{
              locked: (
                <Link to='/settings/profile'>
                  <FormattedMessage id='compose_form.lock_disclaimer.lock' defaultMessage='locked' />
                </Link>
              ),
            }}
          />
        )}
      />
    );
  }

  if (hashtagWarning) {
    return (
      <Warning
        message={(
          <FormattedMessage
            id='compose_form.hashtag_warning'
            defaultMessage="This post won't be listed under any hashtag as it is unlisted. Only public posts can be searched by hashtag."
          />
        )}
      />
    );
  }

  if (directMessageWarning) {
    const message = (
      <span>
        <FormattedMessage
          id='compose_form.direct_message_warning'
          defaultMessage='This post will only be sent to the mentioned users.'
        />
      </span>
    );

    return <Warning message={message} />;
  }

  return null;
};

export default WarningWrapper;
