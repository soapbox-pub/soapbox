import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Virtuoso } from 'react-virtuoso';

import { usePopularTags } from 'soapbox/api/hooks';
import { Column, Text } from 'soapbox/components/ui';

import TagListItem from './components/discover/tag-list-item';

import type { GroupTag } from 'soapbox/schemas';

const messages = defineMessages({
  title: { id: 'groups.tags.title', defaultMessage: 'Browse Topics' },
});

const Tags: React.FC = () => {
  const intl = useIntl();

  const { tags, isFetched, isError, hasNextPage, fetchNextPage } = usePopularTags();
  const isEmpty = (isFetched && tags.length === 0) || isError;

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = (index: number, tag: GroupTag) => (
    <div
      className={
        clsx({
          'pt-4': index !== 0,
        })
      }
    >
      <TagListItem key={tag.id} tag={tag} />
    </div>
  );

  return (
    <Column label={intl.formatMessage(messages.title)}>
      {isEmpty ? (
        <Text theme='muted'>
          <FormattedMessage
            id='groups.discover.tags.empty'
            defaultMessage='Unable to fetch popular topics at this time. Please check back later.'
          />
        </Text>
      ) : (
        <Virtuoso
          useWindowScroll
          data={tags}
          itemContent={renderItem}
          endReached={handleLoadMore}
        />
      )}
    </Column>
  );
};

export default Tags;
