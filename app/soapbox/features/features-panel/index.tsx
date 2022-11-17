import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Column, Toggle } from 'soapbox/components/ui';
import { useFeatures } from 'soapbox/hooks';

const messages = defineMessages({
  title: { id: 'features.title', defaultMessage: 'Features' },
});

interface IFeaturesPanel {
  features: Record<string, any>,
}

/** A UI for managing conditional feature flags. */
const FeaturesPanel: React.FC<IFeaturesPanel> = ({ features: userFeatures }) => {
  const intl = useIntl();
  const autoFeatures = useFeatures();

  const features = useMemo(() => {
    return Object.assign({ ...autoFeatures }, { ...userFeatures });
  }, [userFeatures, autoFeatures]);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <List>
        {Object.keys(autoFeatures).map(key => (
          <ListItem label={key}>
            <Toggle checked={features[key]} />
          </ListItem>
        ))}
      </List>
    </Column>
  );
};

export default FeaturesPanel;