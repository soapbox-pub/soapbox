import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Icon } from 'soapbox/components/ui';

import type { Group } from 'soapbox/schemas';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeaderImage {
  group?: Group | false | null
  className?: string
}

const GroupHeaderImage: React.FC<IGroupHeaderImage> = ({ className, group }) => {
  const intl = useIntl();

  const [isHeaderMissing, setIsHeaderMissing] = useState<boolean>(false);

  if (!group || !group.header) {
    return null;
  }

  if (isHeaderMissing) {
    return (
      <div
        className={clsx(className, 'flex items-center justify-center bg-gray-200 dark:bg-gray-800/30')}
      >
        <Icon
          src={require('@tabler/icons/photo-off.svg')}
          className='h-6 w-6 text-gray-500 dark:text-gray-700'
        />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={group.header}
      alt={intl.formatMessage(messages.header)}
      onError={() => setIsHeaderMissing(true)}
    />
  );
};

export default GroupHeaderImage;
