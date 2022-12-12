import React, { useCallback, useEffect } from 'react';

import { fetchGroup } from 'soapbox/actions/groups';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Column, Layout } from 'soapbox/components/ui';
import GroupHeader from 'soapbox/features/group/components/group-header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  GroupInfoPanel,
  SignUpPanel,
  CtaBanner,
} from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetGroup } from 'soapbox/selectors';

interface IGroupPage {
  params?: {
    id?: string,
  },
}

/** Page to display a group. */
const ProfilePage: React.FC<IGroupPage> = ({ params, children }) => {
  const id = params?.id || '';

  const dispatch = useAppDispatch();

  const getGroup = useCallback(makeGetGroup(), []);
  const group = useAppSelector(state => getGroup(state, id));

  const me = useAppSelector(state => state.me);

  useEffect(() => {
    dispatch(fetchGroup(id));
  }, [id]);

  if (group === false) {
    return (
      <MissingIndicator />
    );
  }

  return (
    <>
      <Layout.Main>
        <Column label={group ? group.display_name : ''} withHeader={false}>
          <div className='space-y-4'>
            <GroupHeader group={group} />

            {group && (
              <BundleContainer fetchComponent={GroupInfoPanel}>
                {Component => <Component group={group} />}
              </BundleContainer>
            )}

            {children}
          </div>
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
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default ProfilePage;
