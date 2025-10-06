import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchHashtag, followHashtag, unfollowHashtag } from '@/actions/tags.ts';
import { expandHashtagTimeline, clearTimeline } from '@/actions/timelines.ts';
import { useHashtagStream } from '@/api/hooks/index.ts';
import List, { ListItem } from '@/components/list.tsx';
import { Column } from '@/components/ui/column.tsx';
import Toggle from '@/components/ui/toggle.tsx';
import Timeline from '@/features/ui/components/timeline.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { useLoggedIn } from '@/hooks/useLoggedIn.ts';

interface IHashtagTimeline {
  params?: {
    id?: string;
  };
}

export const HashtagTimeline: React.FC<IHashtagTimeline> = ({ params }) => {
  const id = params?.id || '';

  const features = useFeatures();
  const dispatch = useAppDispatch();
  const tag = useAppSelector((state) => state.tags.get(id));
  const next = useAppSelector(state => state.timelines.get(`hashtag:${id}`)?.next);
  const { isLoggedIn } = useLoggedIn();

  const handleLoadMore = (maxId: string) => {
    dispatch(expandHashtagTimeline(id, { url: next, maxId }));
  };

  const handleFollow = () => {
    if (tag?.following) {
      dispatch(unfollowHashtag(id));
    } else {
      dispatch(followHashtag(id));
    }
  };

  useHashtagStream(id);

  useEffect(() => {
    dispatch(expandHashtagTimeline(id));
    dispatch(fetchHashtag(id));
  }, [id]);

  useEffect(() => {
    dispatch(clearTimeline(`hashtag:${id}`));
    dispatch(expandHashtagTimeline(id));
  }, [id]);

  return (
    <Column label={`#${id}`} slim>
      {features.followHashtags && isLoggedIn && (
        <List>
          <ListItem
            label={<FormattedMessage id='hashtag.follow' defaultMessage='Follow hashtag' />}
          >
            <Toggle
              checked={tag?.following}
              onChange={handleFollow}
            />
          </ListItem>
        </List>
      )}
      <Timeline
        className='black:p-4 black:sm:p-5'
        scrollKey='hashtag_timeline'
        timelineId={`hashtag:${id}`}
        onLoadMore={handleLoadMore}
        emptyMessage={<FormattedMessage id='empty_column.hashtag' defaultMessage='There is nothing in this hashtag yet.' />}
      />
    </Column>
  );
};

export default HashtagTimeline;
