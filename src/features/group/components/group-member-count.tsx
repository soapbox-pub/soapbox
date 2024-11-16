import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Text from 'soapbox/components/ui/text.tsx';
import { Group } from 'soapbox/types/entities.ts';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

interface IGroupMemberCount {
  group: Group;
}

const GroupMemberCount = ({ group }: IGroupMemberCount) => {
  return (
    <Link to={`/group/${group.slug}/members`} className='hover:underline'>
      <Text theme='inherit' tag='span' size='sm' weight='medium' data-testid='group-member-count'>
        {shortNumberFormat(group.members_count)}
        {' '} {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
        <FormattedMessage
          id='groups.discover.search.results.member_count'
          defaultMessage='{members, plural, one {member} other {members}}'
          values={{
            members: group.members_count,
          }}
        />
      </Text>
    </Link>
  );
};

export default GroupMemberCount;