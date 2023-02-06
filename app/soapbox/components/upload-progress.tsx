import React from 'react';
import { FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';

import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import Motion from 'soapbox/features/ui/util/optional-motion';

interface IUploadProgress {
  /** Number between 0 and 1 to represent the percentage complete. */
  progress: number,
}

/** Displays a progress bar for uploading files. */
const UploadProgress: React.FC<IUploadProgress> = ({ progress }) => {
  return (
    <HStack alignItems='center' space={2}>
      <Icon
        src={require('@tabler/icons/cloud-upload.svg')}
        className='h-7 w-7 text-gray-500'
      />

      <Stack space={1}>
        <Text theme='muted'>
          <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />
        </Text>

        <div className='relative h-1.5 w-full rounded-lg bg-gray-200'>
          <Motion defaultStyle={{ width: 0 }} style={{ width: spring(progress) }}>
            {({ width }) =>
              (<div
                className='absolute left-0 top-0 h-1.5 rounded-lg bg-primary-600'
                style={{ width: `${width}%` }}
              />)
            }
          </Motion>
        </div>
      </Stack>
    </HStack>
  );
};

export default UploadProgress;
