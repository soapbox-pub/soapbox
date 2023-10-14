import React from 'react';

import { isPubkey } from 'soapbox/utils/nostr';

import { Tooltip } from './ui';

import type { Mention as MentionEntity } from 'soapbox/schemas';

interface IMention {
  mention: Pick<MentionEntity, 'acct' | 'username'>;
}

const Mention: React.FC<IMention> = ({ mention: { acct, username } }) => {
  return (
    <Tooltip text={`@${acct}`}>
      <button
        className='text-primary-600 hover:underline dark:text-accent-blue'
        type='button'
        dir='ltr'
      >
        @{isPubkey(username) ? username.slice(0, 8) : username}
      </button>
    </Tooltip>
  );
};

export default Mention;