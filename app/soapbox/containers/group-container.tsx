import React, { useCallback } from 'react';

import GroupCard from 'soapbox/components/group-card';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetGroup } from 'soapbox/selectors';

interface IGroupContainer {
  id: string
}

const GroupContainer: React.FC<IGroupContainer> = (props) => {
  const { id, ...rest } = props;

  const getGroup = useCallback(makeGetGroup(), []);
  const group = useAppSelector(state => getGroup(state, id));

  if (group) {
    return <GroupCard group={group} {...rest} />;
  } else {
    return null;
  }
};

export default GroupContainer;
