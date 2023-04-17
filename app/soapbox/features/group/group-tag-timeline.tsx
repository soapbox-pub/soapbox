import React from 'react';

import { Column } from 'soapbox/components/ui';
import { useGroup, useGroupTag } from 'soapbox/hooks/api';

type RouteParams = { id: string, groupId: string };

interface IGroupTimeline {
  params: RouteParams
}

const GroupTagTimeline: React.FC<IGroupTimeline> = (props) => {
  const groupId = props.params.groupId;
  const tagId = props.params.id;

  const { group } = useGroup(groupId);
  const { tag } = useGroupTag(tagId);

  if (!group) {
    return null;
  }

  return (
    <Column label={`#${tag}`}>
      {/* TODO */}
    </Column>
  );
};

export default GroupTagTimeline;
