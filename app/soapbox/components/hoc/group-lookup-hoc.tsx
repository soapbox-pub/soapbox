import React from 'react';

import { useGroupLookup } from 'soapbox/api/hooks';
import ColumnLoading from 'soapbox/features/ui/components/column-loading';

import { Layout } from '../ui';

interface IGroupLookup {
  params: {
    groupSlug: string
  }
}

interface IMaybeGroupLookup {
  params?: {
    groupSlug?: string
    groupId?: string
  }
}

function GroupLookupHoc(Component: React.ComponentType<{ params: { groupId: string } }>) {
  const GroupLookup: React.FC<IGroupLookup> = (props) => {
    const { entity: group } = useGroupLookup(props.params.groupSlug);

    if (!group) return (
      <>
        <Layout.Main>
          <ColumnLoading />
        </Layout.Main>

        <Layout.Aside />
      </>
    );

    const newProps = {
      ...props,
      params: {
        ...props.params,
        id: group.id,
        groupId: group.id,
      },
    };

    return (
      <Component {...newProps} />
    );
  };

  const MaybeGroupLookup: React.FC<IMaybeGroupLookup> = (props) => {
    const { params } = props;

    if (params?.groupId) {
      return <Component {...props} params={{ ...params, groupId: params.groupId }} />;
    } else {
      return <GroupLookup {...props} params={{ ...params, groupSlug: params?.groupSlug || '' }} />;
    }
  };

  return MaybeGroupLookup;
}

export default GroupLookupHoc;