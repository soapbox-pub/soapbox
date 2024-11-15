import buildingCommunityIcon from '@tabler/icons/outline/building-community.svg';
import homeIcon from '@tabler/icons/outline/home-2.svg';
import mapPinIcon from '@tabler/icons/outline/map-pin.svg';
import roadIcon from '@tabler/icons/outline/road.svg';


import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

export const ADDRESS_ICONS: Record<string, string> = {
  house: homeIcon,
  street: roadIcon,
  secondary: roadIcon,
  zone: buildingCommunityIcon,
  city: buildingCommunityIcon,
  administrative: buildingCommunityIcon,
};

interface IAutosuggestLocation {
  id: string;
}

const AutosuggestLocation: React.FC<IAutosuggestLocation> = ({ id }) => {
  const location = useAppSelector((state) => state.locations.get(id));

  if (!location) return null;

  return (
    <HStack alignItems='center' space={2}>
      <Icon src={ADDRESS_ICONS[location.type] || mapPinIcon} />
      <Stack>
        <Text>{location.description}</Text>
        <Text size='xs' theme='muted'>{[location.street, location.locality, location.country].filter(val => val?.trim()).join(' · ')}</Text>
      </Stack>
    </HStack>
  );
};

export default AutosuggestLocation;
