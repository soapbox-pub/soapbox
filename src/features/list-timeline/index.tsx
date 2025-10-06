import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchList } from '@/actions/lists.ts';
import { openModal } from '@/actions/modals.ts';
import { expandListTimeline } from '@/actions/timelines.ts';
import { useListStream } from '@/api/hooks/index.ts';
import MissingIndicator from '@/components/missing-indicator.tsx';
import Button from '@/components/ui/button.tsx';
import { Column } from '@/components/ui/column.tsx';
import Spinner from '@/components/ui/spinner.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';

import Timeline from '../ui/components/timeline.tsx';

const ListTimeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const list = useAppSelector((state) => state.lists.get(id));
  const next = useAppSelector(state => state.timelines.get(`list:${id}`)?.next);

  useListStream(id);

  useEffect(() => {
    dispatch(fetchList(id));
    dispatch(expandListTimeline(id));
  }, [id]);

  const handleLoadMore = (maxId: string) => {
    dispatch(expandListTimeline(id, { url: next, maxId }));
  };

  const handleEditClick = () => {
    dispatch(openModal('LIST_EDITOR', { listId: id }));
  };

  const title  = list ? list.title : id;

  if (typeof list === 'undefined') {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (list === false) {
    return (
      <MissingIndicator />
    );
  }

  const emptyMessage = (
    <div>
      <FormattedMessage id='empty_column.list' defaultMessage='There is nothing in this list yet. When members of this list create new posts, they will appear here.' />
      <br /><br />
      <Button onClick={handleEditClick}><FormattedMessage id='list.click_to_add' defaultMessage='Click here to add people' /></Button>
    </div>
  );

  return (
    <Column label={title}>
      <Timeline
        className='black:p-4 black:sm:p-5'
        scrollKey='list_timeline'
        timelineId={`list:${id}`}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
      />
    </Column>
  );
};

export default ListTimeline;
