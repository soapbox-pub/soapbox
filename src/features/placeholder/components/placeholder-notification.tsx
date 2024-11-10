import { memo } from 'react';

import { HStack } from 'soapbox/components/ui/index.ts';

import PlaceholderAvatar from './placeholder-avatar.tsx';
import PlaceholderDisplayName from './placeholder-display-name.tsx';
import PlaceholderStatusContent from './placeholder-status-content.tsx';

/** Fake notification to display while data is loading. */
const PlaceholderNotification = () => (
  <div className='bg-white px-4 py-6 black:bg-black dark:bg-primary-900 sm:p-6'>
    <div className='w-full animate-pulse'>
      <div className='mb-2'>
        <PlaceholderStatusContent minLength={20} maxLength={20} />
      </div>

      <div>
        <HStack space={3} alignItems='center'>
          <div className='shrink-0'>
            <PlaceholderAvatar size={48} />
          </div>

          <div className='min-w-0 flex-1'>
            <PlaceholderDisplayName minLength={3} maxLength={25} />
          </div>
        </HStack>
      </div>

      <div className='mt-4'>
        <PlaceholderStatusContent minLength={5} maxLength={120} />
      </div>
    </div>
  </div>
);

export default memo(PlaceholderNotification);
