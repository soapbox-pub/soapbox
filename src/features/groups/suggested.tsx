import clsx from 'clsx';
import { forwardRef, useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Components, Virtuoso, VirtuosoGrid } from 'react-virtuoso';

import { useSuggestedGroups } from 'soapbox/api/hooks/index.ts';
import { Column } from 'soapbox/components/ui/column.tsx';

import GroupGridItem from './components/discover/group-grid-item.tsx';
import GroupListItem from './components/discover/group-list-item.tsx';
import LayoutButtons, { GroupLayout } from './components/discover/layout-buttons.tsx';

import type { Group } from 'soapbox/schemas/index.ts';

const messages = defineMessages({
  label: { id: 'groups.suggested.label', defaultMessage: 'Suggested Groups' },
});

const GridList: Components['List'] = forwardRef((props, ref) => {
  const { context, ...rest } = props;
  return <div ref={ref} {...rest} className='flex flex-wrap' />;
});

const Suggested: React.FC = () => {
  const intl = useIntl();

  const [layout, setLayout] = useState<GroupLayout>(GroupLayout.LIST);

  const { groups, hasNextPage, fetchNextPage } = useSuggestedGroups();

  const handleLoadMore = () => {
    if (hasNextPage) {
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
    <Column
      label={intl.formatMessage(messages.label)}
      action={
        <LayoutButtons
          layout={layout}
          onSelect={(selectedLayout) => setLayout(selectedLayout)}
        />
      }
    >
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
    </Column>
  );
};

export default Suggested;
