import { Map as ImmutableMap } from 'immutable';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { updateSoapboxConfig } from 'soapbox/actions/admin';
import { getHost } from 'soapbox/actions/instance';
import { fetchSoapboxConfig } from 'soapbox/actions/soapbox';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import FeaturesPanel from '../features-panel';

const messages = defineMessages({
  saved: { id: 'features_editor.saved', defaultMessage: 'Features updated!' },
});

interface IFeaturesEditor {
}

/** Admin feature editor. */
const FeaturesEditor: React.FC<IFeaturesEditor> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const host = useAppSelector(state => getHost(state));
  const rawConfig = useAppSelector(state => state.soapbox);

  const userFeatures: Record<string, boolean> = useAppSelector(state => {
    return (state.soapbox.get('features') || ImmutableMap()).toJS();
  });

  const updateFeatures = async (features: Record<string, boolean>) => {
    const params = rawConfig.set('features', features).toJS();
    await dispatch(updateSoapboxConfig(params));
  };

  const handleChange = async(features: Record<string, boolean>) => {
    setSubmitting(true);

    try {
      await dispatch(fetchSoapboxConfig(host));
      await updateFeatures(features);
      toast.success(intl.formatMessage(messages.saved));
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <FeaturesPanel
      features={userFeatures}
      onChange={handleChange}
      disabled={submitting}
    />
  );
};

export default FeaturesEditor;