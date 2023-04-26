import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'soapbox/actions/compose';
import { openModal } from 'soapbox/actions/modals';
import { Avatar, Button, HStack } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { useGroupLookup } from 'soapbox/hooks/api/groups/useGroupLookup';

const ComposeButton = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/group/')) {
    return <GroupComposeButton />;
  }

  return <HomeComposeButton />;
};

const HomeComposeButton = () => {
  const dispatch = useAppDispatch();
  const onOpenCompose = () => dispatch(openModal('COMPOSE'));

  return (
    <Button
      theme='accent'
      icon={require('@tabler/icons/pencil-plus.svg')}
      size='lg'
      onClick={onOpenCompose}
      block
    >
      <FormattedMessage id='navigation.compose' defaultMessage='Compose' />
    </Button>
  );
};

const GroupComposeButton = () => {
  const dispatch = useAppDispatch();
  const match = useRouteMatch<{ groupSlug: string }>('/group/:groupSlug');
  const { entity: group } = useGroupLookup(match?.params.groupSlug || '');

  const onOpenCompose = () => {
    if (group) {
      dispatch(groupComposeModal(group));
    }
  };

  if (group) {
    return (
      <Button
        theme='accent'
        size='lg'
        onClick={onOpenCompose}
        block
      >
        <HStack space={3} alignItems='center'>
          <Avatar className='-my-1 border-2 border-white' size={30} src={group.avatar} />
          <span>
            <FormattedMessage id='navigation.compose_group' defaultMessage='Compose to Group' />
          </span>
        </HStack>
      </Button>
    );
  }

  return null;
};

export default ComposeButton;
