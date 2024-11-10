import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { closeModal } from 'soapbox/actions/modals.ts';
import CopyableInput from 'soapbox/components/copyable-input.tsx';
import SafeEmbed from 'soapbox/components/safe-embed.tsx';
import { Modal, Stack, Text, Divider } from 'soapbox/components/ui/index.ts';
import { useAppDispatch } from 'soapbox/hooks/index.ts';
import useEmbed from 'soapbox/queries/embed.ts';

interface IEmbedModal {
  url: string;
  onError: (error: any) => void;
}

const EmbedModal: React.FC<IEmbedModal> = ({ url, onError }) => {
  const dispatch = useAppDispatch();
  const { data: embed, error, isError } = useEmbed(url);

  useEffect(() => {
    if (error && isError) {
      onError(error);
    }
  }, [isError]);

  const handleClose = () => {
    dispatch(closeModal('EMBED'));
  };

  return (
    <Modal
      title={<FormattedMessage id='status.embed' defaultMessage='Embed post' />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <Text theme='muted'>
          <FormattedMessage id='embed.instructions' defaultMessage='Embed this post on your website by copying the code below.' />
        </Text>

        <CopyableInput value={embed?.html || ''} />
      </Stack>

      <div className='py-9'>
        <Divider />
      </div>

      <SafeEmbed
        className='w-full overflow-hidden rounded-xl'
        sandbox='allow-same-origin allow-scripts'
        title='embedded-status'
        html={embed?.html}
      />
    </Modal>
  );
};

export default EmbedModal;
