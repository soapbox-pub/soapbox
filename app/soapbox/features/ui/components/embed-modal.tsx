import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { closeModal } from 'soapbox/actions/modals';
import SafeEmbed from 'soapbox/components/safe-embed';
import { Modal, Stack, Text, Input, Divider } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import useEmbed from 'soapbox/queries/embed';

interface IEmbedModal {
  url: string,
  onError: (error: any) => void,
}

const EmbedModal: React.FC<IEmbedModal> = ({ url, onError }) => {
  const dispatch = useAppDispatch();
  const { data: embed, error, isError } = useEmbed(url);

  useEffect(() => {
    if (error && isError) {
      onError(error);
    }
  }, [isError]);

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    e.currentTarget.select();
  };

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

        <Input
          type='text'
          readOnly
          value={embed?.html || ''}
          onClick={handleInputClick}
        />
      </Stack>

      <div className='py-9'>
        <Divider />
      </div>

      <SafeEmbed
        className='rounded-xl overflow-hidden w-full'
        sandbox='allow-same-origin allow-scripts'
        title='embedded-status'
        html={embed?.html}
      />
    </Modal>
  );
};

export default EmbedModal;
