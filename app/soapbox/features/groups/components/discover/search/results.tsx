import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Components, Virtuoso, VirtuosoGrid } from 'react-virtuoso';

import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useGroupSearch } from 'soapbox/queries/groups/search';
import { Group } from 'soapbox/types/entities';
import { shortNumberFormat } from 'soapbox/utils/numbers';

import GroupComp from '../group';

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
    <HStack
      alignItems='center'
      justifyContent='between'
      className={
        clsx({
          'pt-4': index !== 0,
        })
      }
    >
      <HStack alignItems='center' space={2}>
        <Avatar
          className='ring-2 ring-white dark:ring-primary-900'
          src={group.avatar}
          size={44}
        />

        <Stack>
          <Text
            weight='bold'
            dangerouslySetInnerHTML={{ __html: group.display_name_html }}
          />

          <HStack className='text-gray-700 dark:text-gray-600' space={1} alignItems='center'>
            <Icon
              className='h-4.5 w-4.5'
              src={group.locked ? require('@tabler/icons/lock.svg') : require('@tabler/icons/world.svg')}
            />

            <Text theme='inherit' tag='span' size='sm' weight='medium'>
              {group.locked ? (
                <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
              ) : (
                <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
              )}
            </Text>

            {typeof group.members_count !== 'undefined' && (
              <>
                <span>&bull;</span>
                <Text theme='inherit' tag='span' size='sm' weight='medium'>
                  {shortNumberFormat(group.members_count)}
                  {' '}
                  members
                </Text>
              </>
            )}
          </HStack>
        </Stack>
      </HStack>

      <Button theme='primary'>
        {group.locked ? 'Request to Join' : 'Join Group'}
      </Button>
    </HStack>
  ), []);

  const renderGroupGrid = useCallback((group: Group, index: number) => (
    <div className='pb-4'>
      <GroupComp group={group} />
    </div>
  ), []);

  return (
    <Stack space={4} data-testid='results'>
      <HStack alignItems='center' justifyContent='between'>
        <Text weight='semibold'>Groups</Text>

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