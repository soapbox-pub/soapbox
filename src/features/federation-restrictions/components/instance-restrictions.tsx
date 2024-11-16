import eyeOffIcon from '@tabler/icons/outline/eye-off.svg';
import lockOpenIcon from '@tabler/icons/outline/lock-open.svg';
import lockIcon from '@tabler/icons/outline/lock.svg';
import photoOffIcon from '@tabler/icons/outline/photo-off.svg';
import shieldCheckIcon from '@tabler/icons/outline/shield-check.svg';
import shieldLockIcon from '@tabler/icons/outline/shield-lock.svg';
import shieldXIcon from '@tabler/icons/outline/shield-x.svg';
import { FormattedMessage } from 'react-intl';

import Icon from 'soapbox/components/icon.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

import type { RemoteInstance } from 'soapbox/selectors/index.ts';

const hasRestrictions = (remoteInstance: RemoteInstance): boolean => {
  const { accept, reject_deletes, report_removal, ...federation } = remoteInstance.federation;
  return !!Object.values(federation).reduce((acc, value) => Boolean(acc || value), false);
};

interface IRestriction {
  icon: string;
  children: React.ReactNode;
}

const Restriction: React.FC<IRestriction> = ({ icon, children }) => {
  return (
    <HStack space={3}>
      <Icon className='size-5 flex-none' src={icon} />

      <Text theme='muted'>
        {children}
      </Text>
    </HStack>
  );
};

interface IInstanceRestrictions {
  remoteInstance: RemoteInstance;
}

const InstanceRestrictions: React.FC<IInstanceRestrictions> = ({ remoteInstance }) => {
  const { instance } = useInstance();

  const renderRestrictions = () => {
    const items = [];

    const {
      avatar_removal,
      banner_removal,
      federated_timeline_removal,
      followers_only,
      media_nsfw,
      media_removal,
    } = remoteInstance.federation;

    const fullMediaRemoval = media_removal && avatar_removal && banner_removal;
    const partialMediaRemoval = media_removal || avatar_removal || banner_removal;

    if (followers_only) {
      items.push((
        <Restriction key='followersOnly' icon={lockIcon}>
          <FormattedMessage
            id='federation_restriction.followers_only'
            defaultMessage='Hidden except to followers'
          />
        </Restriction>
      ));
    } else if (federated_timeline_removal) {
      items.push((
        <Restriction key='federatedTimelineRemoval' icon={lockOpenIcon}>
          <FormattedMessage
            id='federation_restriction.federated_timeline_removal'
            defaultMessage='Fediverse timeline removal'
          />
        </Restriction>
      ));
    }

    if (fullMediaRemoval) {
      items.push((
        <Restriction key='fullMediaRemoval' icon={photoOffIcon}>
          <FormattedMessage
            id='federation_restriction.full_media_removal'
            defaultMessage='Full media removal'
          />
        </Restriction>
      ));
    } else if (partialMediaRemoval) {
      items.push((
        <Restriction key='partialMediaRemoval' icon={photoOffIcon}>
          <FormattedMessage
            id='federation_restriction.partial_media_removal'
            defaultMessage='Partial media removal'
          />
        </Restriction>
      ));
    }

    if (!fullMediaRemoval && media_nsfw) {
      items.push((
        <Restriction key='mediaNsfw' icon={eyeOffIcon}>
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

    const host = remoteInstance.host;
    const siteTitle = instance.title;

    if (remoteInstance.federation.reject === true) {
      return (
        <Restriction icon={shieldXIcon}>
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
          <Restriction icon={shieldLockIcon}>
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
        <Restriction icon={shieldCheckIcon}>
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
