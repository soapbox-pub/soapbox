import React from 'react';

import { useGroupLookup } from 'soapbox/hooks/api/groups/useGroupLookup';

import { Spinner } from '../ui';

interface IGroupLookup {
  params: {
    groupSlug: string
  }
}

function GroupLookupHoc(Component: React.ComponentType<{ params: { groupId: string } }>) {
  const GroupLookup: React.FC<IGroupLookup> = (props) => {
    const { entity: group } = useGroupLookup(props.params.groupSlug);
    if (!group) return (
      <Spinner />
    );

    const newProps = {
      ...props,
      params: {
        ...props.params,
        id: group.id,
        groupId: group.id,
      },
    };

    return (
      <Component {...newProps} />
    );
  };

  return GroupLookup;
}

export default GroupLookupHoc;