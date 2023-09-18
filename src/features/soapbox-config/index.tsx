import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';
import React, { useState, useEffect, useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { updateSoapboxConfig } from 'soapbox/actions/admin';
import { uploadMedia } from 'soapbox/actions/media';
import List, { ListItem } from 'soapbox/components/list';
import {
  Accordion,
  Button,
  Column,
  CardHeader,
  CardTitle,
  FileInput,
  Form,
  FormActions,
  FormGroup,
  Input,
  Streamfield,
  Textarea,
  Toggle,
} from 'soapbox/components/ui';
import ThemeSelector from 'soapbox/features/ui/components/theme-selector';
import { useAppSelector, useAppDispatch, useFeatures } from 'soapbox/hooks';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import toast from 'soapbox/toast';

import CryptoAddressInput from './components/crypto-address-input';
import FooterLinkInput from './components/footer-link-input';
import PromoPanelInput from './components/promo-panel-input';
import SitePreview from './components/site-preview';

const messages = defineMessages({
  heading: { id: 'column.soapbox_config', defaultMessage: 'Soapbox config' },
  saved: { id: 'soapbox_config.saved', defaultMessage: 'Soapbox config saved!' },
  copyrightFooterLabel: { id: 'soapbox_config.copyright_footer.meta_fields.label_placeholder', defaultMessage: 'Copyright footer' },
  cryptoDonatePanelLimitLabel: { id: 'soapbox_config.crypto_donate_panel_limit.meta_fields.limit_placeholder', defaultMessage: 'Number of items to display in the crypto homepage widget' },
  customCssLabel: { id: 'soapbox_config.custom_css.meta_fields.url_placeholder', defaultMessage: 'URL' },
  rawJSONLabel: { id: 'soapbox_config.raw_json_label', defaultMessage: 'Advanced: Edit raw JSON data' },
  rawJSONHint: { id: 'soapbox_config.raw_json_hint', defaultMessage: 'Edit the settings data directly. Changes made directly to the JSON file will override the form fields above. Click "Save" to apply your changes.' },
  rawJSONInvalid: { id: 'soapbox_config.raw_json_invalid', defaultMessage: 'is invalid' },
  verifiedCanEditNameLabel: { id: 'soapbox_config.verified_can_edit_name_label', defaultMessage: 'Allow verified users to edit their own display name.' },
  displayFqnLabel: { id: 'soapbox_config.display_fqn_label', defaultMessage: 'Display domain (eg @user@domain) for local accounts.' },
  greentextLabel: { id: 'soapbox_config.greentext_label', defaultMessage: 'Enable greentext support' },
  promoPanelIconsLink: { id: 'soapbox_config.hints.promo_panel_icons.link', defaultMessage: 'Soapbox Icons List' },
  authenticatedProfileLabel: { id: 'soapbox_config.authenticated_profile_label', defaultMessage: 'Profiles require authentication' },
  authenticatedProfileHint: { id: 'soapbox_config.authenticated_profile_hint', defaultMessage: 'Users must be logged-in to view replies and media on user profiles.' },
  displayCtaLabel: { id: 'soapbox_config.cta_label', defaultMessage: 'Display call to action panels if not authenticated' },
  mediaPreviewLabel: { id: 'soapbox_config.media_preview_label', defaultMessage: 'Prefer preview media for thumbnails' },
  mediaPreviewHint: { id: 'soapbox_config.media_preview_hint', defaultMessage: 'Some backends provide an optimized version of media for display in timelines. However, these preview images may be too small without additional configuration.' },
  feedInjectionLabel: { id: 'soapbox_config.feed_injection_label', defaultMessage: 'Feed injection' },
  feedInjectionHint: { id: 'soapbox_config.feed_injection_hint', defaultMessage: 'Inject the feed with additional content, such as suggested profiles.' },
  tileServerLabel: { id: 'soapbox_config.tile_server_label', defaultMessage: 'Map tile server' },
  tileServerAttributionLabel: { id: 'soapbox_config.tile_server_attribution_label', defaultMessage: 'Map tiles attribution' },
  redirectRootNoLoginLabel: { id: 'soapbox_config.redirect_root_no_login_label', defaultMessage: 'Redirect homepage' },
  redirectRootNoLoginHint: { id: 'soapbox_config.redirect_root_no_login_hint', defaultMessage: 'Path to redirect the homepage when a user is not logged in.' },
});

type ValueGetter<T = Element> = (e: React.ChangeEvent<T>) => any;
type Template = ImmutableMap<string, any>;
type ConfigPath = Array<string | number>;
type ThemeChangeHandler = (theme: string) => void;

const templates: Record<string, Template> = {
  promoPanelItem: ImmutableMap({ icon: '', text: '', url: '' }),
  footerItem: ImmutableMap({ title: '', url: '' }),
  cryptoAddress: ImmutableMap({ ticker: '', address: '', note: '' }),
};

const SoapboxConfig: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const features = useFeatures();

  const initialData = useAppSelector(state => state.soapbox);

  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const [jsonEditorExpanded, setJsonEditorExpanded] = useState(false);
  const [rawJSON, setRawJSON] = useState<string>(JSON.stringify(initialData, null, 2));
  const [jsonValid, setJsonValid] = useState(true);

  const soapbox = useMemo(() => {
    return normalizeSoapboxConfig(data);
  }, [data]);

  const setConfig = (path: ConfigPath, value: any) => {
    const newData = data.setIn(path, value);
    setData(newData);
    setJsonValid(true);
  };

  const putConfig = (newData: any) => {
    setData(newData);
    setJsonValid(true);
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    dispatch(updateSoapboxConfig(data.toJS())).then(() => {
      setLoading(false);
      toast.success(intl.formatMessage(messages.saved));
    }).catch(() => {
      setLoading(false);
    });
    setLoading(true);
    e.preventDefault();
  };

  const handleChange = (path: ConfigPath, getValue: ValueGetter<any>): React.ChangeEventHandler => {
    return e => {
      setConfig(path, getValue(e));
    };
  };

  const handleThemeChange = (path: ConfigPath): ThemeChangeHandler => {
    return theme => {
      setConfig(path, theme);
    };
  };

  const handleFileChange = (path: ConfigPath): React.ChangeEventHandler<HTMLInputElement> => {
    return e => {
      const data = new FormData();
      const file = e.target.files?.item(0);

      if (file) {
        data.append('file', file);

        dispatch(uploadMedia(data)).then(({ data }: any) => {
          handleChange(path, () => data.url)(e);
        }).catch(console.error);
      }
    };
  };

  const handleStreamItemChange = (path: ConfigPath) => {
    return (values: any[]) => {
      setConfig(path, ImmutableList(values));
    };
  };

  const addStreamItem = (path: ConfigPath, template: Template) => {
    return () => {
      const items = data.getIn(path) || ImmutableList();
      setConfig(path, items.push(template));
    };
  };

  const deleteStreamItem = (path: ConfigPath) => {
    return (i: number) => {
      const newData = data.deleteIn([...path, i]);
      setData(newData);
    };
  };

  const handleEditJSON: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setRawJSON(e.target.value);
  };

  const toggleJSONEditor = (expanded: boolean) => setJsonEditorExpanded(expanded);

  useEffect(() => {
    putConfig(initialData);
  }, [initialData]);

  useEffect(() => {
    setRawJSON(JSON.stringify(data, null, 2));
  }, [data]);

  useEffect(() => {
    try {
      const data = fromJS(JSON.parse(rawJSON));
      putConfig(data);
    } catch {
      setJsonValid(false);
    }
  }, [rawJSON]);

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <fieldset className='space-y-6' disabled={isLoading}>
          <SitePreview soapbox={soapbox} />

          <FormGroup
            labelText={<FormattedMessage id='soapbox_config.fields.logo_label' defaultMessage='Logo' />}
            hintText={<FormattedMessage id='soapbox_config.hints.logo' defaultMessage='SVG. At most 2 MB. Will be displayed to 50px height, maintaining aspect ratio' />}
          >
            <FileInput
              onChange={handleFileChange(['logo'])}
              accept='image/svg+xml,image/png'
            />
          </FormGroup>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='soapbox_config.headings.theme' defaultMessage='Theme' />} />
          </CardHeader>

          <List>
            <ListItem label={<FormattedMessage id='soapbox_config.fields.theme_label' defaultMessage='Default theme' />}>
              <ThemeSelector
                value={soapbox.defaultSettings.get('themeMode')}
                onChange={handleThemeChange(['defaultSettings', 'themeMode'])}
              />
            </ListItem>

            <ListItem
              label={<FormattedMessage id='soapbox_config.fields.edit_theme_label' defaultMessage='Edit theme' />}
              to='/soapbox/admin/theme'
            />
          </List>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='soapbox_config.headings.options' defaultMessage='Options' />} />
          </CardHeader>

          <List>
            <ListItem label={intl.formatMessage(messages.verifiedCanEditNameLabel)}>
              <Toggle
                checked={soapbox.verifiedCanEditName === true}
                onChange={handleChange(['verifiedCanEditName'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem label={intl.formatMessage(messages.displayFqnLabel)}>
              <Toggle
                checked={soapbox.displayFqn === true}
                onChange={handleChange(['displayFqn'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem label={intl.formatMessage(messages.greentextLabel)}>
              <Toggle
                checked={soapbox.greentext === true}
                onChange={handleChange(['greentext'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.feedInjectionLabel)}
              hint={intl.formatMessage(messages.feedInjectionHint)}
            >
              <Toggle
                checked={soapbox.feedInjection === true}
                onChange={handleChange(['feedInjection'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.mediaPreviewLabel)}
              hint={intl.formatMessage(messages.mediaPreviewHint)}
            >
              <Toggle
                checked={soapbox.mediaPreview === true}
                onChange={handleChange(['mediaPreview'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem label={intl.formatMessage(messages.displayCtaLabel)}>
              <Toggle
                checked={soapbox.displayCta === true}
                onChange={handleChange(['displayCta'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.authenticatedProfileLabel)}
              hint={intl.formatMessage(messages.authenticatedProfileHint)}
            >
              <Toggle
                checked={soapbox.authenticatedProfile === true}
                onChange={handleChange(['authenticatedProfile'], (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.redirectRootNoLoginLabel)}
              hint={intl.formatMessage(messages.redirectRootNoLoginHint)}
            >
              <Input
                type='text'
                placeholder='/timeline/local'
                value={String(data.get('redirectRootNoLogin', ''))}
                onChange={handleChange(['redirectRootNoLogin'], (e) => e.target.value)}
              />
            </ListItem>
          </List>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='soapbox_config.headings.navigation' defaultMessage='Navigation' />} />
          </CardHeader>

          <Streamfield
            label={<FormattedMessage id='soapbox_config.fields.promo_panel_fields_label' defaultMessage='Promo panel items' />}
            hint={<FormattedMessage id='soapbox_config.hints.promo_panel_fields' defaultMessage='You can have custom defined links displayed on the right panel of the timelines page.' />}
            component={PromoPanelInput}
            values={soapbox.promoPanel.items.toArray()}
            onChange={handleStreamItemChange(['promoPanel', 'items'])}
            onAddItem={addStreamItem(['promoPanel', 'items'], templates.promoPanel)}
            onRemoveItem={deleteStreamItem(['promoPanel', 'items'])}
          />

          <Streamfield
            label={<FormattedMessage id='soapbox_config.fields.home_footer_fields_label' defaultMessage='Home footer items' />}
            hint={<FormattedMessage id='soapbox_config.hints.home_footer_fields' defaultMessage='You can have custom defined links displayed on the footer of your static pages' />}
            component={FooterLinkInput}
            values={soapbox.navlinks.get('homeFooter')?.toArray() || []}
            onChange={handleStreamItemChange(['navlinks', 'homeFooter'])}
            onAddItem={addStreamItem(['navlinks', 'homeFooter'], templates.footerItem)}
            onRemoveItem={deleteStreamItem(['navlinks', 'homeFooter'])}
          />

          <FormGroup labelText={intl.formatMessage(messages.copyrightFooterLabel)}>
            <Input
              type='text'
              placeholder={intl.formatMessage(messages.copyrightFooterLabel)}
              value={soapbox.copyright}
              onChange={handleChange(['copyright'], (e) => e.target.value)}
            />
          </FormGroup>

          {features.events && (
            <>
              <CardHeader>
                <CardTitle title={<FormattedMessage id='soapbox_config.headings.events' defaultMessage='Events' />} />
              </CardHeader>

              <FormGroup labelText={intl.formatMessage(messages.tileServerLabel)}>
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.tileServerLabel)}
                  value={soapbox.tileServer}
                  onChange={handleChange(['tileServer'], (e) => e.target.value)}
                />
              </FormGroup>

              <FormGroup labelText={intl.formatMessage(messages.tileServerAttributionLabel)}>
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.tileServerAttributionLabel)}
                  value={soapbox.tileServerAttribution}
                  onChange={handleChange(['tileServerAttribution'], (e) => e.target.value)}
                />
              </FormGroup>
            </>
          )}

          <CardHeader>
            <CardTitle title={<FormattedMessage id='soapbox_config.headings.cryptocurrency' defaultMessage='Cryptocurrency' />} />
          </CardHeader>

          <Streamfield
            label={<FormattedMessage id='soapbox_config.fields.crypto_addresses_label' defaultMessage='Cryptocurrency addresses' />}
            hint={<FormattedMessage id='soapbox_config.hints.crypto_addresses' defaultMessage='Add cryptocurrency addresses so users of your site can donate to you. Order matters, and you must use lowercase ticker values.' />}
            component={CryptoAddressInput}
            values={soapbox.cryptoAddresses.toArray()}
            onChange={handleStreamItemChange(['cryptoAddresses'])}
            onAddItem={addStreamItem(['cryptoAddresses'], templates.cryptoAddress)}
            onRemoveItem={deleteStreamItem(['cryptoAddresses'])}
          />

          <FormGroup labelText={intl.formatMessage(messages.cryptoDonatePanelLimitLabel)}>
            <Input
              type='number'
              min={0}
              pattern='[0-9]+'
              placeholder={intl.formatMessage(messages.cryptoDonatePanelLimitLabel)}
              value={soapbox.cryptoDonatePanel.get('limit')}
              onChange={handleChange(['cryptoDonatePanel', 'limit'], (e) => Number(e.target.value))}
            />
          </FormGroup>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='soapbox_config.headings.advanced' defaultMessage='Advanced' />} />
          </CardHeader>

          <Accordion
            headline={intl.formatMessage(messages.rawJSONLabel)}
            expanded={jsonEditorExpanded}
            onToggle={toggleJSONEditor}
          >
            <FormGroup
              hintText={intl.formatMessage(messages.rawJSONHint)}
              errors={jsonValid ? undefined : [intl.formatMessage(messages.rawJSONInvalid)]}
            >
              <Textarea
                value={rawJSON}
                onChange={handleEditJSON}
                isCodeEditor
                rows={12}
              />
            </FormGroup>
          </Accordion>
        </fieldset>

        <FormActions>
          <Button type='submit'>
            <FormattedMessage id='soapbox_config.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export default SoapboxConfig;
