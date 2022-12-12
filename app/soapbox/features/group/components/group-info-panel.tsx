import React from 'react';

import Markup from 'soapbox/components/markup';
import { HStack, Stack, Text } from 'soapbox/components/ui';
import { Group } from 'soapbox/types/entities';

interface IGroupInfoPanel {
  group: Group,
}

const GroupInfoPanel: React.FC<IGroupInfoPanel> = ({ group }) => (
  <div className='mt-6 min-w-0 flex-1 sm:px-2'>
    <Stack space={2}>
      <Stack>
        <HStack space={1} alignItems='center'>
          <Text size='lg' weight='bold' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
        </HStack>
      </Stack>

      {group.note.length > 0 && (
        <Markup size='sm' dangerouslySetInnerHTML={{ __html: group.note_emojified }} />
      )}
    </Stack>
  </div>
);

export default GroupInfoPanel;
