import clsx from 'clsx';
import { memo } from 'react';

import HStack from 'soapbox/components/ui/hstack.tsx';

import PlaceholderAvatar from './placeholder-avatar.tsx';
import PlaceholderDisplayName from './placeholder-display-name.tsx';
import PlaceholderStatusContent from './placeholder-status-content.tsx';

interface IPlaceholderStatus {
  variant?: 'rounded' | 'slim' | 'default';
}

/** Fake status to display while data is loading. */
const PlaceholderStatus: React.FC<IPlaceholderStatus> = ({ variant }) => (
  <div
    className={clsx({
      'status-placeholder bg-white black:bg-black dark:bg-primary-900': true,
      'shadow-xl dark:shadow-none sm:rounded-xl px-4 py-6 sm:p-5': variant === 'rounded',
      'py-4': variant === 'slim',
    })}
  >
    <div className='w-full animate-pulse overflow-hidden'>
      <div>
        <HStack space={3} alignItems='center'>
          <div className='shrink-0'>
            <PlaceholderAvatar size={42} />
          </div>

          <div className='min-w-0 flex-1'>
            <PlaceholderDisplayName minLength={3} maxLength={25} />
          </div>
        </HStack>
      </div>

      <div className='status--content-wrapper mt-4'>
        <PlaceholderStatusContent minLength={5} maxLength={120} />
      </div>
    </div>
  </div>
);

export default memo(PlaceholderStatus);
