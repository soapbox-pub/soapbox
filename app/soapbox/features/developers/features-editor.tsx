import { Map as ImmutableMap } from 'immutable';
import React from 'react';

import { useSettings } from 'soapbox/hooks';

import FeaturesPanel from '../features-panel';

interface IFeaturesEditor {
}

/** Developers feature editor. */
const FeaturesEditor: React.FC<IFeaturesEditor> = () => {
  const settings = useSettings();
  const features = (settings.get('features') || ImmutableMap()).toJS() as Record<string, any>;

  return (
    <FeaturesPanel features={features} />
  );
};

export default FeaturesEditor;