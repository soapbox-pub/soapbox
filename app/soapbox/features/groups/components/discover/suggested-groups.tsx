import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Carousel, Stack, Text } from 'soapbox/components/ui';
import PlaceholderGroupDiscover from 'soapbox/features/placeholder/components/placeholder-group-discover';
import { useSuggestedGroups } from 'soapbox/queries/groups';

import GroupGridItem from './group-grid-item';

const SuggestedGroups = () => {
  const { groups, isFetching, isFetched, isError } = useSuggestedGroups();
  const isEmpty = (isFetched && groups.length === 0) || isError;

  const [groupCover, setGroupCover] = useState<HTMLDivElement | null>(null);

  return (
    <Stack space={4}>
      <Text size='xl' weight='bold'>
        <FormattedMessage
          id='groups.discover.suggested.title'
          defaultMessage='Suggested For You'
        />
      </Text>

      {isEmpty ? (
        <Text theme='muted'>
          <FormattedMessage
            id='groups.discover.suggested.empty'
            defaultMessage='Unable to fetch suggested groups at this time. Please check back later.'
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

export default SuggestedGroups;