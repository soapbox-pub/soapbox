import cloudUploadIcon from '@tabler/icons/outline/cloud-upload.svg';
import { FormattedMessage } from 'react-intl';

import { HStack, Icon, ProgressBar, Stack, Text } from 'soapbox/components/ui/index.ts';

interface IUploadProgress {
  /** Number between 0 and 100 to represent the percentage complete. */
  progress: number;
}

/** Displays a progress bar for uploading files. */
const UploadProgress: React.FC<IUploadProgress> = ({ progress }) => {
  return (
    <HStack alignItems='center' space={2}>
      <Icon
        src={cloudUploadIcon}
        className='size-7 text-gray-500'
      />

      <Stack space={1}>
        <Text theme='muted'>
          <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />
        </Text>

        <ProgressBar progress={progress / 100} size='sm' />
      </Stack>
    </HStack>
  );
};

export default UploadProgress;
