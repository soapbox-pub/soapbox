import React, { useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Accordion } from 'soapbox/components/ui';
import { useAppSelector, useInstance } from 'soapbox/hooks';
import { makeGetHosts } from 'soapbox/selectors';
import { federationRestrictionsDisclosed } from 'soapbox/utils/state';

import RestrictedInstance from './components/restricted-instance';

import type { OrderedSet as ImmutableOrderedSet } from 'immutable';

const messages = defineMessages({
  heading: { id: 'column.federation_restrictions', defaultMessage: 'Federation Restrictions' },
  boxTitle: { id: 'federation_restrictions.explanation_box.title', defaultMessage: 'Instance-specific policies' },
  boxMessage: { id: 'federation_restrictions.explanation_box.message', defaultMessage: 'Normally servers on the Fediverse can communicate freely. {siteTitle} has imposed restrictions on the following servers.' },
  emptyMessage: { id: 'federation_restrictions.empty_message', defaultMessage: '{siteTitle} has not restricted any instances.' },
  notDisclosed: { id: 'federation_restrictions.not_disclosed_message', defaultMessage: '{siteTitle} does not disclose federation restrictions through the API.' },
});

const FederationRestrictions = () => {
  const intl = useIntl();
  const instance = useInstance();

  const getHosts = useCallback(makeGetHosts(), []);

  const hosts = useAppSelector((state) => getHosts(state)) as ImmutableOrderedSet<string>;
  const disclosed = useAppSelector((state) => federationRestrictionsDisclosed(state));

  const [explanationBoxExpanded, setExplanationBoxExpanded] = useState(true);

  const toggleExplanationBox = (setting: boolean) => {
    setExplanationBoxExpanded(setting);
  };

  const emptyMessage = disclosed ? messages.emptyMessage : messages.notDisclosed;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Accordion
        headline={intl.formatMessage(messages.boxTitle)}
        expanded={explanationBoxExpanded}
        onToggle={toggleExplanationBox}
      >
        {intl.formatMessage(messages.boxMessage, { siteTitle: instance.title })}
      </Accordion>

      <div className='pt-4'>
        <ScrollableList emptyMessage={intl.formatMessage(emptyMessage, { siteTitle: instance.title })}>
          {hosts.map((host) => <RestrictedInstance key={host} host={host} />)}
        </ScrollableList>
      </div>
    </Column>
  );
};

export default FederationRestrictions;
