import debounce from 'lodash/debounce';
import React, { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { fetchFollowedHashtags, expandFollowedHashtags } from 'soapbox/actions/tags';
import Hashtag from 'soapbox/components/hashtag';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column } from 'soapbox/components/ui';
import PlaceholderHashtag from 'soapbox/features/placeholder/components/placeholder-hashtag';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandFollowedHashtags());
}, 300, { leading: true });

const FollowedTags = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchFollowedHashtags());
  }, []);

  const tags = useAppSelector((state => state.followed_tags.items));
  const isLoading = useAppSelector((state => state.followed_tags.isLoading));
  const hasMore = useAppSelector((state => !!state.followed_tags.next));

  const emptyMessage = <FormattedMessage id='empty_column.followed_tags' defaultMessage="You haven't followed any hashtag yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='followed_tags'
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={() => handleLoadMore(dispatch)}
        placeholderComponent={PlaceholderHashtag}
        placeholderCount={5}
        itemClassName='pb-3'
      >
        {tags.map(tag => <Hashtag key={tag.name} hashtag={tag} />)}
      </ScrollableList>
    </Column>
  );
};

export default FollowedTags;
