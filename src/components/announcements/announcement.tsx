import { FormattedDate } from 'react-intl';

import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { getTextDirection } from 'soapbox/utils/rtl.ts';

import AnnouncementContent from './announcement-content.tsx';
import ReactionsBar from './reactions-bar.tsx';

import type { Announcement as AnnouncementEntity } from 'soapbox/schemas/index.ts';

interface IAnnouncement {
  announcement: AnnouncementEntity;
}

const Announcement: React.FC<IAnnouncement> = ({ announcement }) => {
  const features = useFeatures();

  const startsAt = announcement.starts_at && new Date(announcement.starts_at);
  const endsAt = announcement.ends_at && new Date(announcement.ends_at);
  const now = new Date();
  const hasTimeRange = startsAt && endsAt;
  const skipYear = hasTimeRange && startsAt.getFullYear() === endsAt.getFullYear() && endsAt.getFullYear() === now.getFullYear();
  const skipEndDate = hasTimeRange && startsAt.getDate() === endsAt.getDate() && startsAt.getMonth() === endsAt.getMonth() && startsAt.getFullYear() === endsAt.getFullYear();
  const skipTime = announcement.all_day;
  const direction = getTextDirection(announcement.content.__html);

  return (
    <Stack className='w-full' space={2}>
      {hasTimeRange && (
        <Text theme='muted' direction={direction}>
          <FormattedDate
            value={startsAt}
            hour12
            year={(skipYear || startsAt.getFullYear() === now.getFullYear()) ? undefined : 'numeric'}
            month='short'
            day='2-digit'
            hour={skipTime ? undefined : 'numeric'}
            minute={skipTime ? undefined : '2-digit'}
          />
          {/* eslint-disable formatjs/no-literal-string-in-jsx */}
          {' '}
          -
          {' '}
          {/* eslint-enable formatjs/no-literal-string-in-jsx */}
          <FormattedDate
            value={endsAt}
            hour12
            year={(skipYear || endsAt.getFullYear() === now.getFullYear()) ? undefined : 'numeric'}
            month={skipEndDate ? undefined : 'short'}
            day={skipEndDate ? undefined : '2-digit'}
            hour={skipTime ? undefined : 'numeric'}
            minute={skipTime ? undefined : '2-digit'}
          />
        </Text>
      )}

      <AnnouncementContent announcement={announcement} />

      {features.announcementsReactions && (
        <ReactionsBar
          reactions={announcement.reactions}
          announcementId={announcement.id}
        />
      )}
    </Stack>
  );
};

export default Announcement;
