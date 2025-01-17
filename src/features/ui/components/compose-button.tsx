import { FormattedMessage } from 'react-intl';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { groupComposeModal } from 'soapbox/actions/compose.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { useGroupLookup } from 'soapbox/api/hooks/index.ts';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

const ComposeButton = () => {
  const location = useLocation();
  const isOnGroupPage = location.pathname.startsWith('/group/');
  const match = useRouteMatch<{ groupSlug: string }>('/group/:groupSlug');
  const { entity: group } = useGroupLookup(match?.params.groupSlug || '');
  const isGroupMember = !!group?.relationship?.member;

  if (isOnGroupPage && isGroupMember) {
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

  if (!group) return null;

  const onOpenCompose = () => {
    dispatch(groupComposeModal(group));
  };

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
};

export default ComposeButton;
