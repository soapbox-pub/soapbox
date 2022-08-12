import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal, Stack, Text, Input } from 'soapbox/components/ui';

import type { Status } from 'soapbox/types/entities';

interface IEmbedModal {
  status: Status,
}

const EmbedModal: React.FC<IEmbedModal> = ({ status }) => {
  const url = `${location.origin}/embed/${status.id}`;
  const embed = `<iframe src="${url}" width="100%" height="300" frameborder="0" />`;

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
            value={embed}
            onClick={handleInputClick}
          />
        </Stack>

        <div dangerouslySetInnerHTML={{ __html: embed }} />
      </Stack>
    </Modal>
  );
};

export default EmbedModal;
