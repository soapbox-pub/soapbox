import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Components, Virtuoso, VirtuosoGrid } from 'react-virtuoso';

import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useGroupSearch } from 'soapbox/hooks/api';
import { Group } from 'soapbox/types/entities';

import GroupGridItem from '../group-grid-item';
import GroupListItem from '../group-list-item';

interface Props {
  groupSearchResult: ReturnType<typeof useGroupSearch>
}

enum Layout {
  LIST = 'LIST',
  GRID = 'GRID'
}

const GridList: Components['List'] = React.forwardRef((props, ref) => {
  const { context, ...rest } = props;
  return <div ref={ref} {...rest} className='flex flex-wrap' />;
});

export default (props: Props) => {
  const { groupSearchResult } = props;

  const [layout, setLayout] = useState<Layout>(Layout.LIST);

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

  const renderGroupGrid = useCallback((group: Group, index: number) => (
    <div className='pb-4'>
      <GroupGridItem group={group} />
    </div>
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

        <HStack alignItems='center'>
          <button onClick={() => setLayout(Layout.LIST)}>
            <Icon
              src={require('@tabler/icons/layout-list.svg')}
              className={
                clsx('h-5 w-5 text-gray-600', {
                  'text-primary-600': layout === Layout.LIST,
                })
              }
            />
          </button>

          <button onClick={() => setLayout(Layout.GRID)}>
            <Icon
              src={require('@tabler/icons/layout-grid.svg')}
              className={
                clsx('h-5 w-5 text-gray-600', {
                  'text-primary-600': layout === Layout.GRID,
                })
              }
            />
          </button>
        </HStack>
      </HStack>

      {layout === Layout.LIST ? (
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
          itemContent={(index, group) => renderGroupGrid(group, index)}
          components={{
            Item: (props) => (
              <div {...props} className='w-1/2 flex-none' />
            ),
            List: GridList,
          }}
          endReached={handleLoadMore}
        />
      )}
    </Stack>
  );
};