import React from 'react';

import { TrendsLink } from 'soapbox/schemas';
import { getTextDirection } from 'soapbox/utils/rtl';

import Blurhash from './blurhash';
import { accountsCountRenderer } from './hashtag';
import { HStack, Icon, Stack, Text } from './ui';

interface ITrendingLink {
  trendingLink: TrendsLink;
}

const TrendingLink: React.FC<ITrendingLink> = ({ trendingLink }) => {
  const count = Number(trendingLink.history?.[0]?.accounts);

  const direction = getTextDirection(trendingLink.title + trendingLink.description);

  let media;

  if (trendingLink.image) {
    media = (
      <div className='relative h-32 w-32 overflow-hidden rounded-md'>
        {trendingLink.blurhash && (
          <Blurhash
            className='absolute inset-0 z-0 h-full w-full'
            hash={trendingLink.blurhash}
          />
        )}
        <img className='relative h-full w-full object-cover' src={trendingLink.image} alt={trendingLink.image_description || undefined} />
      </div>
    );
  }

  return (
    <a
      className='flex cursor-pointer gap-4 overflow-hidden rounded-lg border border-solid border-gray-200 p-4 text-sm text-gray-800 no-underline hover:bg-gray-100 hover:no-underline dark:border-gray-800 dark:text-gray-200 dark:hover:bg-primary-800/30'
      href={trendingLink.url}
      target='_blank'
      rel='noopener'
    >
      {media}
      <Stack space={2} className='flex-1 overflow-hidden'>
        <Text className='line-clamp-2' weight='bold' direction={direction}>{trendingLink.title}</Text>
        {trendingLink.description && <Text truncate direction={direction}>{trendingLink.description}</Text>}
        <HStack alignItems='center' wrap className='divide-x-dot text-gray-700 dark:text-gray-600'>
          <HStack space={1} alignItems='center'>
            <Text tag='span' theme='muted'>
              <Icon src={require('@tabler/icons/outline/link.svg')} />
            </Text>
            <Text tag='span' theme='muted' size='sm' direction={direction}>
              {trendingLink.provider_name}
            </Text>
          </HStack>

          {!!count && accountsCountRenderer(count)}
        </HStack>
      </Stack>
    </a>
  );
};

export default TrendingLink;
