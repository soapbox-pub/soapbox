import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Text } from 'soapbox/components/ui';
import { Group } from 'soapbox/types/entities';
import { shortNumberFormat } from 'soapbox/utils/numbers';

interface IGroupMemberCount {
  group: Group
}

const GroupMemberCount = ({ group }: IGroupMemberCount) => {
  return (
    <Text theme='inherit' tag='span' size='sm' weight='medium' data-testid='group-member-count'>
      {shortNumberFormat(group.members_count)}
      {' '}
      <FormattedMessage
        id='groups.discover.search.results.member_count'
        defaultMessage='{members, plural, one {member} other {members}}'
        values={{
          members: group.members_count,
        }}
      />
    </Text>
  );
};

export default GroupMemberCount;