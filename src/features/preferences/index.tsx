import { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings.ts';
import List, { ListItem } from '@/components/list.tsx';
import Form from '@/components/ui/form.tsx';
import { SelectDropdown } from '@/features/forms/index.tsx';
import SettingToggle from '@/features/notifications/components/setting-toggle.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { useSettings } from '@/hooks/useSettings.ts';

const languages = {
  en: 'English',
  ar: 'العربية',
  ast: 'Asturianu',
  bg: 'Български',
  bn: 'বাংলা',
  ca: 'Català',
  co: 'Corsu',
  cs: 'Čeština',
  cy: 'Cymraeg',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  'en-Shaw': '𐑖𐑱𐑝𐑾𐑯',
  eo: 'Esperanto',
  es: 'Español',
  eu: 'Euskara',
  fa: 'فارسی',
  fi: 'Suomi',
  fr: 'Français',
  ga: 'Gaeilge',
  gl: 'Galego',
  he: 'עברית',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hu: 'Magyar',
  hy: 'Հայերեն',
  id: 'Bahasa Indonesia',
  io: 'Ido',
  is: 'íslenska',
  it: 'Italiano',
  ja: '日本語',
  jv: 'ꦧꦱꦗꦮ',
  ka: 'ქართული',
  kk: 'Қазақша',
  ko: '한국어',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  ml: 'മലയാളം',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  no: 'Norsk',
  oc: 'Occitan',
  pl: 'Polski',
  pt: 'Português',
  'pt-BR': 'Português do Brasil',
  ro: 'Română',
  ru: 'Русский',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sq: 'Shqip',
  sr: 'Српски',
  'sr-Latn': 'Srpski (latinica)',
  sv: 'Svenska',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  zh: '中文',
  'zh-CN': '简体中文',
  'zh-HK': '繁體中文（香港）',
  'zh-TW': '繁體中文（臺灣）',
};

const messages = defineMessages({
  heading: { id: 'column.preferences', defaultMessage: 'Preferences' },
  displayPostsDefault: { id: 'preferences.fields.display_media.default', defaultMessage: 'Hide posts marked as sensitive' },
  displayPostsHideAll: { id: 'preferences.fields.display_media.hide_all', defaultMessage: 'Always hide posts' },
  displayPostsShowAll: { id: 'preferences.fields.display_media.show_all', defaultMessage: 'Always show posts' },
  privacy_public: { id: 'preferences.options.privacy_public', defaultMessage: 'Public' },
  privacy_unlisted: { id: 'preferences.options.privacy_unlisted', defaultMessage: 'Unlisted' },
  privacy_followers_only: { id: 'preferences.options.privacy_followers_only', defaultMessage: 'Followers-only' },
  content_type_plaintext: { id: 'preferences.options.content_type_plaintext', defaultMessage: 'Plain text' },
  content_type_markdown: { id: 'preferences.options.content_type_markdown', defaultMessage: 'Markdown' },
});

const Preferences = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const settings = useSettings();

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, path: string[]) => {
    dispatch(changeSetting(path, event.target.value, { showAlert: true }));
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    dispatch(changeSetting(key, checked, { showAlert: true }));
  };

  const displayMediaOptions = useMemo(() => ({
    default: intl.formatMessage(messages.displayPostsDefault),
    hide_all: intl.formatMessage(messages.displayPostsHideAll),
    show_all: intl.formatMessage(messages.displayPostsShowAll),
  }), []);

  const defaultPrivacyOptions = useMemo(() => ({
    public: intl.formatMessage(messages.privacy_public),
    unlisted: intl.formatMessage(messages.privacy_unlisted),
    private: intl.formatMessage(messages.privacy_followers_only),
  }), []);

  const defaultContentTypeOptions = useMemo(() => ({
    'text/plain': intl.formatMessage(messages.content_type_plaintext),
    'text/markdown': intl.formatMessage(messages.content_type_markdown),
  }), []);

  return (
    <Form>
      <List>
        <ListItem label={<FormattedMessage id='home.column_settings.show_reblogs' defaultMessage='Show reposts' />}>
          <SettingToggle settings={settings} settingPath={['home', 'shows', 'reblog']} onChange={onToggleChange} />
        </ListItem>

        <ListItem label={<FormattedMessage id='home.column_settings.show_replies' defaultMessage='Show replies' />}>
          <SettingToggle settings={settings} settingPath={['home', 'shows', 'reply']} onChange={onToggleChange} />
        </ListItem>
      </List>

      <List>
        <ListItem label={<FormattedMessage id='preferences.fields.language_label' defaultMessage='Display Language' />}>
          <SelectDropdown
            className='max-w-[200px]'
            items={languages}
            defaultValue={settings.locale}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectChange(event, ['locale'])}
          />
        </ListItem>

        <ListItem label={<FormattedMessage id='preferences.fields.media_display_label' defaultMessage='Sensitive content' />}>
          <SelectDropdown
            className='max-w-[200px]'
            items={displayMediaOptions}
            defaultValue={settings.displayMedia}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectChange(event, ['displayMedia'])}
          />
        </ListItem>

        {features.privacyScopes && (
          <ListItem label={<FormattedMessage id='preferences.fields.privacy_label' defaultMessage='Default post privacy' />}>
            <SelectDropdown
              className='max-w-[200px]'
              items={defaultPrivacyOptions}
              defaultValue={settings.defaultPrivacy}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectChange(event, ['defaultPrivacy'])}
            />
          </ListItem>
        )}

        {features.richText && (
          <ListItem label={<FormattedMessage id='preferences.fields.content_type_label' defaultMessage='Default post format' />}>
            <SelectDropdown
              className='max-w-[200px]'
              items={defaultContentTypeOptions}
              defaultValue={settings.defaultContentType}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectChange(event, ['defaultContentType'])}
            />
          </ListItem>
        )}

        {features.spoilers && (
          <ListItem label={<FormattedMessage id='preferences.fields.preserve_spoilers_label' defaultMessage='Preserve content warning when replying' />}>
            <SettingToggle settings={settings} settingPath={['preserveSpoilers']} onChange={onToggleChange} />
          </ListItem>
        )}
      </List>

      <List>
        <ListItem label={<FormattedMessage id='preferences.fields.boost_modal_label' defaultMessage='Show confirmation dialog before reposting' />}>
          <SettingToggle settings={settings} settingPath={['boostModal']} onChange={onToggleChange} />
        </ListItem>

        <ListItem label={<FormattedMessage id='preferences.fields.delete_modal_label' defaultMessage='Show confirmation dialog before deleting a post' />}>
          <SettingToggle settings={settings} settingPath={['deleteModal']} onChange={onToggleChange} />
        </ListItem>
      </List>

      <List>
        <ListItem label={<FormattedMessage id='preferences.fields.auto_play_gif_label' defaultMessage='Auto-play animated GIFs' />}>
          <SettingToggle settings={settings} settingPath={['autoPlayGif']} onChange={onToggleChange} />
        </ListItem>

        {features.spoilers && <ListItem label={<FormattedMessage id='preferences.fields.expand_spoilers_label' defaultMessage='Always expand posts marked with content warnings' />}>
          <SettingToggle settings={settings} settingPath={['expandSpoilers']} onChange={onToggleChange} />
        </ListItem>}

        <ListItem label={<FormattedMessage id='preferences.fields.autoload_timelines_label' defaultMessage='Automatically load new posts when scrolled to the top of the page' />}>
          <SettingToggle settings={settings} settingPath={['autoloadTimelines']} onChange={onToggleChange} />
        </ListItem>

        <ListItem label={<FormattedMessage id='preferences.fields.autoload_more_label' defaultMessage='Automatically load more items when scrolled to the bottom of the page' />}>
          <SettingToggle settings={settings} settingPath={['autoloadMore']} onChange={onToggleChange} />
        </ListItem>
      </List>
    </Form>
  );
};

export { Preferences as default, languages };
