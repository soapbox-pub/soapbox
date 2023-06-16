import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { Avatar, Card, HStack, Icon, IconButton, Stack, Text } from 'soapbox/components/ui';
import StatusCard from 'soapbox/features/status/components/card';
import { useInstance } from 'soapbox/hooks';
import { AdKeys } from 'soapbox/queries/ads';

import type { Ad as AdEntity } from 'soapbox/types/soapbox';

interface IAd {
  ad: AdEntity
}

/** Displays an ad in sponsored post format. */
const Ad: React.FC<IAd> = ({ ad }) => {
  const queryClient = useQueryClient();
  const instance = useInstance();

  const timer = useRef<NodeJS.Timeout | undefined>(undefined);
  const infobox = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Fetch the impression URL (if any) upon displaying the ad.
  // Don't fetch it more than once.
  useQuery(['ads', 'impression', ad.impression], async () => {
    if (ad.impression) {
      return await axios.get(ad.impression);
    }
  }, { cacheTime: Infinity, staleTime: Infinity });

  /** Invalidate query cache for ads. */
  const bustCache = (): void => {
    queryClient.invalidateQueries(AdKeys.ads);
  };

  /** Toggle the info box on click. */
  const handleInfoButtonClick: React.MouseEventHandler = () => {
    setShowInfo(!showInfo);
  };

  /** Hide the info box when clicked outside. */
  const handleClickOutside = (event: MouseEvent) => {
    if (event.target && infobox.current && !infobox.current.contains(event.target as any)) {
      setShowInfo(false);
    }
  };

  // Hide the info box when clicked outside.
  // https://stackoverflow.com/a/42234988
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [infobox]);

  // Wait until the ad expires, then invalidate cache.
  useEffect(() => {
    if (ad.expires_at) {
      const delta = new Date(ad.expires_at).getTime() - (new Date()).getTime();
      timer.current = setTimeout(bustCache, delta);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [ad.expires_at]);

  return (
    <div className='relative'>
      <Card className='py-4' variant='rounded'>
        <Stack space={4}>
          <HStack alignItems='center' space={3}>
            <Avatar src={instance.thumbnail} size={42} />

            <Stack grow>
              <HStack space={1}>
                <Text size='sm' weight='semibold' truncate>
                  {instance.title}
                </Text>

                <Icon
                  className='h-4 w-4 stroke-accent-500'
                  src={require('@tabler/icons/timeline.svg')}
                />
              </HStack>

              <Stack>
                <HStack alignItems='center' space={1}>
                  <Text theme='muted' size='sm' truncate>
                    <FormattedMessage id='sponsored.subtitle' defaultMessage='Sponsored post' />
                  </Text>
                </HStack>
              </Stack>
            </Stack>

            <Stack justifyContent='center'>
              <IconButton
                iconClassName='h-6 w-6 stroke-gray-600'
                src={require('@tabler/icons/info-circle.svg')}
                onClick={handleInfoButtonClick}
              />
            </Stack>
          </HStack>

          <StatusCard card={ad.card} onOpenMedia={() => { }} horizontal />
        </Stack>
      </Card>

      {showInfo && (
        <div ref={infobox} className='absolute right-5 top-5 max-w-[234px]'>
          <Card variant='rounded'>
            <Stack space={2}>
              <Text size='sm' weight='bold'>
                <FormattedMessage id='sponsored.info.title' defaultMessage='Why am I seeing this ad?' />
              </Text>

              <Text size='sm' theme='muted'>
                {ad.reason ? (
                  ad.reason
                ) : (
                  <FormattedMessage
                    id='sponsored.info.message'
                    defaultMessage='{siteTitle} displays ads to help fund our service.'
                    values={{ siteTitle: instance.title }}
                  />
                )}
              </Text>
            </Stack>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Ad;
