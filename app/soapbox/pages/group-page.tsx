import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { fetchGroup } from 'soapbox/actions/groups';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Column, Layout } from 'soapbox/components/ui';
import GroupHeader from 'soapbox/features/group/components/group-header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  CtaBanner,
  GroupMediaPanel,
  SignUpPanel,
} from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetGroup } from 'soapbox/selectors';

import { Tabs } from '../components/ui';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
});

interface IGroupPage {
  params?: {
    id?: string
  }
  children: React.ReactNode
}

/** Page to display a group. */
const GroupPage: React.FC<IGroupPage> = ({ params, children }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const dispatch = useAppDispatch();

  const id = params?.id || '';

  const getGroup = useCallback(makeGetGroup(), []);
  const group = useAppSelector(state => getGroup(state, id));
  const me = useAppSelector(state => state.me);

  useEffect(() => {
    dispatch(fetchGroup(id));
  }, [id]);

  if ((group as any) === false) {
    return (
      <MissingIndicator />
    );
  }

  const items = [
    {
      text: intl.formatMessage(messages.all),
      to: `/groups/${group?.id}`,
      name: '/groups/:id',
    },
    {
      text: intl.formatMessage(messages.members),
      to: `/groups/${group?.id}/members`,
      name: '/groups/:id/members',
    },
  ];

  return (
    <>
      <Layout.Main>
        <Column label={group ? group.display_name : ''} withHeader={false}>
          <GroupHeader group={group} />

          <Tabs
            items={items}
            activeItem={match.path}
          />

          {children}
        </Column>

        {!me && (
          <BundleContainer fetchComponent={CtaBanner}>
            {Component => <Component key='cta-banner' />}
          </BundleContainer>
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <BundleContainer fetchComponent={SignUpPanel}>
            {Component => <Component key='sign-up-panel' />}
          </BundleContainer>
        )}
        <BundleContainer fetchComponent={GroupMediaPanel}>
          {Component => <Component group={group} />}
        </BundleContainer>
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default GroupPage;
