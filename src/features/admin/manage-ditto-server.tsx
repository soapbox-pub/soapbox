import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { uploadMedia } from 'soapbox/actions/media.ts';
import { HTTPError } from 'soapbox/api/HTTPError.ts';
import { useInstanceV2 } from 'soapbox/api/hooks/instance/useInstanceV2.ts';
import StillImage from 'soapbox/components/still-image.tsx';
import { Button } from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import FileInput from 'soapbox/components/ui/file-input.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import  Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack  from 'soapbox/components/ui/stack.tsx';
import Streamfield from 'soapbox/components/ui/streamfield.tsx';
import { useManageDittoServer } from 'soapbox/features/admin/hooks/useManageDittoServer.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { normalizeAttachment } from 'soapbox/normalizers/index.ts';
import { thumbnailSchema } from 'soapbox/schemas/instance.ts';
import { Screenshots } from 'soapbox/schemas/manifest.ts';
import toast from 'soapbox/toast.tsx';

import type { StreamfieldComponent } from 'soapbox/components/ui/streamfield.tsx';

const messages = defineMessages({
  heading: { id: 'column.admin.ditto_server.manage', defaultMessage: 'Manage Ditto Server' },
  title: { id: 'column.admin.ditto_server.title', defaultMessage: 'Title' },
  description: { id: 'column.admin.ditto_server.description', defaultMessage: 'Description' },
  short_description: { id: 'column.admin.ditto_server.short_description', defaultMessage: 'Short Description' },
  thumbnail:  { id: 'column.admin.ditto_server.thumbnail', defaultMessage: 'Thumbnail' },
  screenshots_label: { id: 'column.admin.ditto_server.screenshots.label', defaultMessage: 'Web Manifest screenshots' },
  screeenshot_label: { id: 'column.admin.ditto_server.screenshot.label', defaultMessage: 'Alternative text describing the image.' },
  upload_screenshot_success: { id: 'column.admin.ditto_server.upload.screenshot.success', defaultMessage: 'Screenshot uploaded!' },
  upload_thumbnail_success: { id: 'column.admin.ditto_server.upload.thumbnail.success', defaultMessage: 'Thumbnail uploaded!' },
  submit_success: { id: 'column.admin.ditto_server.submit.success', defaultMessage: 'Submitted successfully!' },
});

/**
 * Params to submit when updating a Ditto instance.
 * @see PUT /api/v1/admin/ditto/instance
 */
export interface DittoInstanceCredentials {
  /** Title of the instance. */
  title: string;
  /** Description of the instance. */
  description: string;
  /** Short description of the instance. */
  short_description: string;
  /** Manifest screenshots. */
  screenshots: Screenshots;
  /** https://docs.joinmastodon.org/entities/Instance/#thumbnail-url */
  thumbnail: Zod.infer<typeof thumbnailSchema>;
}

/**
 * Main component that handles the logic and UI for managing a Ditto instance.
 * Allows the admin to view and edit title, description, screenshots (Manifest field), etc...
 *
 * @returns A component that renders the Ditto Server management interface.
 */
const ManageDittoServer: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { updateDittoInstance } = useManageDittoServer();
  const { instance } = useInstanceV2();

  const [data, setData] = useState<DittoInstanceCredentials>({
    title: instance?.title ?? '',
    description: instance?.description ?? '',
    short_description: instance?.short_description ?? '',
    screenshots: instance?.screenshots ?? [],
    thumbnail: instance?.thumbnail ?? { url: '', versions: {} },
  });

  const [isThumbnailLoading, setThumbnailLoading] = useState<boolean>(false);

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();
    updateDittoInstance(data, {
      onSuccess: async () => {
        toast.success(messages.submit_success);
      },
      onError: async (err) => {
        if (err instanceof HTTPError) {
          try {
            const { error } = await err.response.json();
            if (typeof error === 'string') {
              toast.error(error);
              return;
            }
          } catch { /* empty */ }
        }
        toast.error(err.message);
      },
    });
  };

  /** Set a single key in the request data. */
  const updateData = (key: string, value: any) => {
    setData(prevData => {
      return { ...prevData, [key]: value };
    });
  };

  const handleTextChange = (key: keyof DittoInstanceCredentials): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => {
    return e => {
      updateData(key, e.target.value);
    };
  };

  const handleStreamItemChange = (key: Extract<keyof DittoInstanceCredentials, 'screenshots'>) => {
    return (values: any[]) => {
      updateData(key, values);
    };
  };

  const deleteStreamItem = (key: Extract<keyof DittoInstanceCredentials, 'screenshots'>) => {
    return (i: number) => {
      setData(prevData => {
        const newData = { ...prevData }[key].toSpliced(i, 1);

        return { ...prevData, [key]: newData };
      });
    };
  };

  const handleAddScreenshot = (): void => {
    setData(prevData => {
      const newData = { ...prevData };
      newData.screenshots.push({
        src: '',
      });

      return newData;
    });
  };

  const handleThumbnailChange = (key: Extract<keyof DittoInstanceCredentials, 'thumbnail'>): React.ChangeEventHandler<HTMLInputElement> => {
    return async(e) => {
      setThumbnailLoading(true);

      const file = e.target.files ? e.target.files[0] : null;
      if (!file) return;

      const data = new FormData();
      data.append('file', file);

      try {
        const response = await dispatch(uploadMedia(data));
        const json = await response.json();
        const attachment = normalizeAttachment(json);

        if (attachment.type !== 'image') {
          throw new Error('Only images supported.');
        }

        setData(prevData => {
          return { ...prevData, [key]: { url: attachment.url, versions: { '@1x': attachment.url, '@2x': attachment.url } } };
        });

        toast.success(messages.upload_thumbnail_success);
        setThumbnailLoading(false);
      } catch (err) {
        setThumbnailLoading(false);
        e.target.value = '';

        if (err instanceof HTTPError) {
          toast.showAlertForError(err);
        }
      }
    };
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>

        <FormGroup labelText={intl.formatMessage(messages.title)}>
          <Input
            type='text'
            value={data.title}
            onChange={handleTextChange('title')}
            placeholder={intl.formatMessage(messages.title)}
          />
        </FormGroup>

        <FormGroup labelText={intl.formatMessage(messages.description)}>
          <Input
            type='text'
            value={data.description}
            onChange={handleTextChange('description')}
            placeholder={intl.formatMessage(messages.description)}
          />
        </FormGroup>


        <FormGroup labelText={intl.formatMessage(messages.short_description)}>
          <Input
            type='text'
            value={data.short_description}
            onChange={handleTextChange('short_description')}
            placeholder={intl.formatMessage(messages.short_description)}
          />
        </FormGroup>

        <FormGroup labelText={intl.formatMessage(messages.thumbnail)}>
          <Stack space={3} grow className='my-2'>
            {!isThumbnailLoading && data.thumbnail.url && <StillImage src={data.thumbnail.url} className='size-5/12' />}

            {isThumbnailLoading && <Spinner size={40} withText />}
            <FileInput
              onChange={handleThumbnailChange('thumbnail')}
              accept='image/png,image/jpeg,image/svg+xml,image/webp'
            />
          </Stack>
        </FormGroup>

        <Streamfield
          label={intl.formatMessage(messages.screenshots_label)}
          component={ScreenshotInput}
          values={data.screenshots || []}
          onChange={handleStreamItemChange('screenshots')}
          onAddItem={handleAddScreenshot}
          onRemoveItem={deleteStreamItem('screenshots')}
        />

        <FormActions>
          <Button to='/admin' theme='tertiary'>
            <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
          </Button>

          <Button theme='primary' type='submit'>
            <FormattedMessage id='save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

type Screenshot = Screenshots[number]

const ScreenshotInput: StreamfieldComponent<Screenshot> = ({ value, onChange }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [isLoading, setLoading] = useState<boolean>(false);

  const handleChange = (key: keyof Screenshot): React.ChangeEventHandler<HTMLInputElement> => {
    return e => {
      onChange({ ...value, [key]: e.currentTarget.value });
    };
  };

  const handleFileChange = (key: Extract<keyof Screenshot, 'src'>): React.ChangeEventHandler<HTMLInputElement> => {
    return async(e) => {
      setLoading(true);

      const file = e.target.files ? e.target.files[0] : null;
      if (!file) return;

      const data = new FormData();
      data.append('file', file);

      try {
        const response = await dispatch(uploadMedia(data));
        const json = await response.json();
        const attachment = normalizeAttachment(json);

        if (attachment.type !== 'image') {
          throw new Error('Only images supported.');
        }

        const width = attachment?.meta?.getIn(['original', 'width']);
        const height = attachment?.meta?.getIn(['original', 'height']);

        if (typeof width === 'number' && typeof height === 'number') {
          onChange({ ...value, [key]: attachment.get('url'), ['sizes']: `${width}x${height}`, 'label': value.label });
        } else {
          onChange({ ...value, [key]: attachment.get('url'), 'label': value.label });
        }

        toast.success(messages.upload_screenshot_success);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        e.target.value = '';

        if (err instanceof HTTPError) {
          toast.showAlertForError(err);
        }
      }
    };
  };

  return (
    <Stack space={3} grow className='my-2'>

      {!isLoading && value.src && <StillImage src={value.src} alt={value.label} className='size-5/12' />}

      {isLoading && <Spinner size={40} withText />}

      <FileInput
        onChange={handleFileChange('src')}
        accept='image/png,image/jpeg,image/svg+xml,image/webp'
      />

      <FormGroup labelText={intl.formatMessage(messages.screeenshot_label)}>
        <Input
          type='text'
          outerClassName='grow'
          value={value.label}
          onChange={handleChange('label')}
          placeholder={intl.formatMessage(messages.screeenshot_label)}
        />
      </FormGroup>

    </Stack>
  );
};

export default ManageDittoServer;