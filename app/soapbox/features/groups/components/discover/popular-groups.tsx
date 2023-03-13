import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Carousel, Stack, Text } from 'soapbox/components/ui';
import PlaceholderGroupDiscover from 'soapbox/features/placeholder/components/placeholder-group-discover';
import { usePopularGroups } from 'soapbox/queries/groups';

import GroupGridItem from './group-grid-item';

const PopularGroups = () => {
  const { groups, isFetching, isFetched, isError } = usePopularGroups();
  const isEmpty = (isFetched && groups.length === 0) || isError;

  const [groupCover, setGroupCover] = useState<HTMLDivElement | null>(null);

  return (
    <Stack space={4}>
      <Text size='xl' weight='bold'>
        <FormattedMessage
          id='groups.discover.popular.title'
          defaultMessage='Popular Groups'
        />
      </Text>

      {isEmpty ? (
        <Text theme='muted'>
          <FormattedMessage
            id='groups.discover.popular.empty'
            defaultMessage='Unable to fetch popular groups at this time. Please check back later.'
          />
        </Text>
      ) : (
        <Carousel
          itemWidth={250}
          itemCount={groups.length}
          controlsHeight={groupCover?.clientHeight}
        >
          {({ width }: { width: number }) => (
            <>
              {isFetching ? (
                new Array(20).fill(0).map((_, idx) => (
                  <div
                    className='relative flex shrink-0 flex-col space-y-2 px-0.5'
                    style={{ width: width || 'auto' }}
                    key={idx}
                  >
                    <PlaceholderGroupDiscover />
                  </div>
                ))
              ) : (
                groups.map((group) => (
                  <GroupGridItem
                    key={group.id}
                    group={group}
                    width={width}
                    ref={setGroupCover}
                  />
                ))
              )}
            </>
          )}
        </Carousel>
      )}
    </Stack>
  );
};

export default PopularGroups;