import xIcon from '@tabler/icons/outline/x.svg';
import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { changeSetting } from 'soapbox/actions/settings.ts';
import { clearTimeline, expandPublicTimeline } from 'soapbox/actions/timelines.ts';
import { usePublicStream } from 'soapbox/api/hooks/index.ts';
import PullToRefresh from 'soapbox/components/pull-to-refresh.tsx';
import Accordion from 'soapbox/components/ui/accordion.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import { LanguageDropdown } from 'soapbox/components/ui/language-dropdown.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';

import PinnedHostsPicker from '../remote-timeline/components/pinned-hosts-picker.tsx';
import Timeline from '../ui/components/timeline.tsx';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Global timeline' },
  dismiss: { id: 'fediverse_tab.explanation_box.dismiss', defaultMessage: 'Don\'t show again' },
});

const PublicTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [language, setLanguage] = useState<string>(localStorage.getItem('soapbox:global:language') || '');

  const { instance } = useInstance();
  const settings = useSettings();
  const onlyMedia = settings.public.other.onlyMedia;
  const next = useAppSelector(state => state.timelines.get('public')?.next);

  const timelineId = 'public';

  const explanationBoxExpanded = settings.explanationBox;
  const showExplanationBox = settings.showExplanationBox && !features.nostr;

  const dismissExplanationBox = () => {
    dispatch(changeSetting(['showExplanationBox'], false));
  };

  const toggleExplanationBox = (setting: boolean) => {
    dispatch(changeSetting(['explanationBox'], setting));
  };

  const handleLoadMore = (maxId: string) => {
    dispatch(expandPublicTimeline({ url: next, maxId, onlyMedia }));
  };

  const handleRefresh = () => {
    return dispatch(expandPublicTimeline({ onlyMedia }));
  };

  usePublicStream({ onlyMedia, language });

  useEffect(() => {
    dispatch(clearTimeline('public'));
    localStorage.setItem('soapbox:global:language', language);
  }, [language]);

  useEffect(() => {
    dispatch(expandPublicTimeline({ onlyMedia, language }));
  }, [onlyMedia, language]);

  return (
    <Column
      label={intl.formatMessage(messages.title)}
      action={features.publicTimelineLanguage ? <LanguageDropdown language={language} setLanguage={setLanguage} /> : null}
      slim
    >
      <PinnedHostsPicker />

      {showExplanationBox && (
        <div className='mb-4 black:mx-4'>
          <Accordion
            headline={<FormattedMessage id='fediverse_tab.explanation_box.title' defaultMessage='What is the Fediverse?' />}
            action={dismissExplanationBox}
            actionIcon={xIcon}
            actionLabel={intl.formatMessage(messages.dismiss)}
            expanded={explanationBoxExpanded}
            onToggle={toggleExplanationBox}
          >
            <FormattedMessage
              id='fediverse_tab.explanation_box.explanation'
              defaultMessage={'{site_title} is part of the Fediverse, a social network made up of thousands of independent social media sites (aka "servers"). The posts you see here are from 3rd-party servers. You have the freedom to engage with them, or to block any server you don\'t like. Pay attention to the full username after the second @ symbol to know which server a post is from. To see only {site_title} posts, visit {local}.'}
              values={{
                site_title: instance.title,
                local: (
                  <Link to='/timeline/local'>
                    <FormattedMessage
                      id='empty_column.home.local_tab'
                      defaultMessage='the {site_title} tab'
                      values={{ site_title: instance.title }}
                    />
                  </Link>
                ),
              }}
            />
          </Accordion>
        </div>
      )}
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-4 black:sm:p-5'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.public' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up' />}
        />
      </PullToRefresh>
    </Column>
  );
};

export default PublicTimeline;
