import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import SafeEmbed from 'soapbox/components/safe-embed';
import { Modal, Stack, Text, Input } from 'soapbox/components/ui';
import useEmbed from 'soapbox/queries/embed';

interface IEmbedModal {
  url: string,
  onError: (error: any) => void,
}

const EmbedModal: React.FC<IEmbedModal> = ({ url, onError }) => {
  const { data: embed, error, isError } = useEmbed(url);

  useEffect(() => {
    if (error && isError) {
      onError(error);
    }
  }, [isError]);

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    e.currentTarget.select();
  };

  return (
    <Modal title={<FormattedMessage id='status.embed' defaultMessage='Embed' />}>
      <Stack space={4}>
        <Stack>
          <Text theme='muted' size='sm'>
            <FormattedMessage id='embed.instructions' defaultMessage='Embed this post on your website by copying the code below.' />
          </Text>

          <Input
            type='text'
            readOnly
            value={embed?.html || ''}
            onClick={handleInputClick}
          />
        </Stack>

        <SafeEmbed
          className='inline-flex rounded-xl overflow-hidden max-w-full'
          sandbox='allow-same-origin'
          title='embedded-status'
          html={embed?.html}
        />
      </Stack>
    </Modal>
  );
};

export default EmbedModal;
