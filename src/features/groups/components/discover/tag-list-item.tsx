import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { Stack, Text } from 'soapbox/components/ui';

import type { GroupTag } from 'soapbox/schemas';

interface ITagListItem {
  tag: GroupTag;
}

const TagListItem = (props: ITagListItem) => {
  const { tag } = props;

  return (
    <Link
      to={`/groups/discover/tags/${tag.id}`}
      className='group'
      data-testid='tag-list-item'
    >
      <Stack>
        <Text
          weight='bold'
          className='group-hover:text-primary-600 group-hover:underline dark:group-hover:text-accent-blue'
        > {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
          #{tag.name}
        </Text>

        <Text size='sm' theme='muted' weight='medium'>
          {/* eslint-disable formatjs/no-literal-string-in-jsx */}
          <FormattedMessage
            id='groups.discovery.tags.no_of_groups'
            defaultMessage='Number of groups'
          />
          :{' '}
          {tag.groups}
          {/* eslint-enable formatjs/no-literal-string-in-jsx */}
        </Text>
      </Stack>
    </Link>
  );
};

export default TagListItem;