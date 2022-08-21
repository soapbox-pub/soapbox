import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import api from 'soapbox/api';
import SafeEmbed from 'soapbox/components/safe-embed';
import { Modal, Stack, Text, Input } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { RootState } from 'soapbox/store';

const fetchEmbed = (url: string) => {
  return (dispatch: any, getState: () => RootState) => {
    return api(getState).get('/api/oembed', { params: { url } });
  };
};

interface IEmbedModal {
  url: string,
  onError: (error: any) => void,
}

const EmbedModal: React.FC<IEmbedModal> = ({ url, onError }) => {
  const dispatch = useAppDispatch();
  const [html, setHtml] = useState('');

  useEffect(() => {
    dispatch(fetchEmbed(url)).then(({ data }) => {
      if (data?.html) {
        setHtml(data.html);
      }
    }).catch(error => {
      onError(error);
    });
  }, []);

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
            value={html}
            onClick={handleInputClick}
          />
        </Stack>

        <SafeEmbed
          className='inline-flex rounded-xl overflow-hidden max-w-full'
          sandbox='allow-same-origin'
          title='embedded-status'
          html={html}
        />
      </Stack>
    </Modal>
  );
};

export default EmbedModal;
