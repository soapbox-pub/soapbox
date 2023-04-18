import React from 'react';
import { useHistory } from 'react-router-dom';

import { Avatar, Button, CardTitle, Stack } from 'soapbox/components/ui';
import { type Card as StatusCard } from 'soapbox/types/entities';

interface IGroupLinkPreview {
  card: StatusCard
}

const GroupLinkPreview: React.FC<IGroupLinkPreview> = ({ card }) => {
  const history = useHistory();

  const { group } = card;
  if (!group) return null;

  const navigateToGroup = () => history.push(`/groups/${group.id}`);

  return (
    <Stack className='cursor-default overflow-hidden rounded-lg border border-gray-300 text-center'>
      <div
        className='-mb-8 h-32 w-full bg-center'
        style={{ backgroundImage: `url(${group.header})` }}
      />

      <Avatar
        className='mx-auto border-4 border-white'
        src={group.avatar}
        size={64}
      />

      <Stack space={4} className='p-4'>
        <CardTitle title={<span dangerouslySetInnerHTML={{ __html: group.display_name_html }} />} />

        <Button theme='primary' onClick={navigateToGroup} block>
          View Group
        </Button>
      </Stack>
    </Stack>
  );
};

export { GroupLinkPreview };