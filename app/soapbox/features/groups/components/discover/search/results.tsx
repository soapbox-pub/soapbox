import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Components, Virtuoso, VirtuosoGrid } from 'react-virtuoso';

import { useGroupSearch } from 'soapbox/api/hooks';
import { HStack, Stack, Text } from 'soapbox/components/ui';

import GroupGridItem from '../group-grid-item';
import GroupListItem from '../group-list-item';
import LayoutButtons, { GroupLayout } from '../layout-buttons';

import type { Group } from 'soapbox/types/entities';

interface Props {
  groupSearchResult: ReturnType<typeof useGroupSearch>
}

const GridList: Components['List'] = React.forwardRef((props, ref) => {
  const { context, ...rest } = props;
  return <div ref={ref} {...rest} className='flex flex-wrap' />;
});

export default (props: Props) => {
  const { groupSearchResult } = props;

  const [layout, setLayout] = useState<GroupLayout>(GroupLayout.LIST);

  const { groups, hasNextPage, isFetching, fetchNextPage } = groupSearchResult;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const renderGroupList = useCallback((group: Group, index: number) => (
    <div
      className={
        clsx({
          'pt-4': index !== 0,
        })
      }
    >
      <GroupListItem group={group} withJoinAction />
    </div>
  ), []);

  const renderGroupGrid = useCallback((group: Group) => (
    <GroupGridItem group={group} />
  ), []);

  return (
    <Stack space={4} data-testid='results'>
      <HStack alignItems='center' justifyContent='between'>
        <Text weight='semibold'>
          <FormattedMessage
            id='groups.discover.search.results.groups'
            defaultMessage='Groups'
          />
        </Text>

        <LayoutButtons
          layout={layout}
          onSelect={(selectedLayout) => setLayout(selectedLayout)}
        />
      </HStack>

      {layout === GroupLayout.LIST ? (
        <Virtuoso
          useWindowScroll
          data={groups}
          itemContent={(index, group) => renderGroupList(group, index)}
          endReached={handleLoadMore}
        />
      ) : (
        <VirtuosoGrid
          useWindowScroll
          data={groups}
          itemContent={(_index, group) => renderGroupGrid(group)}
          components={{
            Item: (props) => (
              <div {...props} className='w-1/2 flex-none pb-4 [&:nth-last-of-type(-n+2)]:pb-0' />
            ),
            List: GridList,
          }}
          endReached={handleLoadMore}
        />
      )}
    </Stack>
  );
};