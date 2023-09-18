'use strict';

import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { HStack, Stack, Text } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks';

import type { Map as ImmutableMap } from 'immutable';

const hasRestrictions = (remoteInstance: ImmutableMap<string, any>): boolean => {
  return remoteInstance
    .get('federation')
    .deleteAll(['accept', 'reject_deletes', 'report_removal'])
    .reduce((acc: boolean, value: boolean) => acc || value, false);
};

interface IRestriction {
  icon: string
  children: React.ReactNode
}

const Restriction: React.FC<IRestriction> = ({ icon, children }) => {
  return (
    <HStack space={3}>
      <Icon className='h-5 w-5 flex-none' src={icon} />

      <Text theme='muted'>
        {children}
      </Text>
    </HStack>
  );
};

interface IInstanceRestrictions {
  remoteInstance: ImmutableMap<string, any>
}

const InstanceRestrictions: React.FC<IInstanceRestrictions> = ({ remoteInstance }) => {
  const instance = useInstance();

  const renderRestrictions = () => {
    const items = [];

    const {
      avatar_removal,
      banner_removal,
      federated_timeline_removal,
      followers_only,
      media_nsfw,
      media_removal,
    } = remoteInstance.get('federation').toJS();

    const fullMediaRemoval = media_removal && avatar_removal && banner_removal;
    const partialMediaRemoval = media_removal || avatar_removal || banner_removal;

    if (followers_only) {
      items.push((
        <Restriction key='followersOnly' icon={require('@tabler/icons/lock.svg')}>
          <FormattedMessage
            id='federation_restriction.followers_only'
            defaultMessage='Hidden except to followers'
          />
        </Restriction>
      ));
    } else if (federated_timeline_removal) {
      items.push((
        <Restriction key='federatedTimelineRemoval' icon={require('@tabler/icons/lock-open.svg')}>
          <FormattedMessage
            id='federation_restriction.federated_timeline_removal'
            defaultMessage='Fediverse timeline removal'
          />
        </Restriction>
      ));
    }

    if (fullMediaRemoval) {
      items.push((
        <Restriction key='fullMediaRemoval' icon={require('@tabler/icons/photo-off.svg')}>
          <FormattedMessage
            id='federation_restriction.full_media_removal'
            defaultMessage='Full media removal'
          />
        </Restriction>
      ));
    } else if (partialMediaRemoval) {
      items.push((
        <Restriction key='partialMediaRemoval' icon={require('@tabler/icons/photo-off.svg')}>
          <FormattedMessage
            id='federation_restriction.partial_media_removal'
            defaultMessage='Partial media removal'
          />
        </Restriction>
      ));
    }

    if (!fullMediaRemoval && media_nsfw) {
      items.push((
        <Restriction key='mediaNsfw' icon={require('@tabler/icons/eye-off.svg')}>
          <FormattedMessage
            id='federation_restriction.media_nsfw'
            defaultMessage='Attachments marked NSFW'
          />
        </Restriction>
      ));
    }

    return items;
  };

  const renderContent = () => {
    if (!instance || !remoteInstance) return null;

    const host = remoteInstance.get('host');
    const siteTitle = instance.get('title');

    if (remoteInstance.getIn(['federation', 'reject']) === true) {
      return (
        <Restriction icon={require('@tabler/icons/shield-x.svg')}>
          <FormattedMessage
            id='remote_instance.federation_panel.restricted_message'
            defaultMessage='{siteTitle} blocks all activities from {host}.'
            values={{ host, siteTitle }}
          />
        </Restriction>
      );
    } else if (hasRestrictions(remoteInstance)) {
      return (
        <>
          <Restriction icon={require('@tabler/icons/shield-lock.svg')}>
            <FormattedMessage
              id='remote_instance.federation_panel.some_restrictions_message'
              defaultMessage='{siteTitle} has placed some restrictions on {host}.'
              values={{ host, siteTitle }}
            />
          </Restriction>

          {renderRestrictions()}
        </>
      );
    } else {
      return (
        <Restriction icon={require('@tabler/icons/shield-check.svg')}>
          <FormattedMessage
            id='remote_instance.federation_panel.no_restrictions_message'
            defaultMessage='{siteTitle} has placed no restrictions on {host}.'
            values={{ host, siteTitle }}
          />
        </Restriction>
      );
    }
  };

  return (
    <Stack space={3}>
      {renderContent()}
    </Stack>
  );
};

export default InstanceRestrictions;
