import React, { useState } from 'react';

import { Carousel, Stack, Text } from 'soapbox/components/ui';
import PlaceholderGroupDiscover from 'soapbox/features/placeholder/components/placeholder-group-discover';
import { usePopularGroups } from 'soapbox/queries/groups';

import Group from './group';

const PopularGroups = () => {
  const { groups, isFetching } = usePopularGroups();

  const [groupCover, setGroupCover] = useState<HTMLDivElement | null>(null);

  return (
    <Stack space={4}>
      <Text size='xl' weight='bold'>
        Popular Groups
      </Text>

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
                <Group
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
    </Stack>
  );
};

export default PopularGroups;