import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useAccount } from 'soapbox/api/hooks/index.ts';
import { InstanceFavicon } from 'soapbox/components/account.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import ActionButton from 'soapbox/features/ui/components/action-button.tsx';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import {
  useSuggestions,
} from 'soapbox/queries/suggestions.ts';

import 'swiper/css';

const PeopleToFollowCard = ({ id }: { id: string }) => {
  const account = useAccount(id).account;
  const { logo } = useSoapboxConfig();

  return (
    <Stack className='rounded-lg' >
      <Stack
        justifyContent='between' className='h-72 min-w-44 rounded-lg border border-primary-300 shadow-card-inset'
        style={{
          backgroundImage: `url(${account?.header ?? logo})`,
          backgroundSize: `${account?.header ? 'cover' : 'auto' }`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: 'full',
        }}
        space={3}
      >

        {account && (<>

          <HStack className='p-2'>
            <HStack
              alignItems='center' space={1} className='max-w-28 rounded-full border bg-primary-500 px-2 py-0.5 !text-white'
            >
              <InstanceFavicon account={account} />
              <Text className='!text-white' size='xs' truncate>
                {account.domain}
              </Text>
            </HStack>
          </HStack>

          <Stack alignItems='center' justifyContent='center' className='pb-6' space={2}>
            <Avatar className='border border-white' src={account.avatar} size={60} />
            <Text className='w-32 text-center text-white' truncate>
              {account.display_name}
            </Text>
            <ActionButton account={account} />

          </Stack>
        </>
        )}

      </Stack>
    </Stack>
  );
};


const AccountsCarousel = () => {
  const isMobile = useIsMobile();
  const { data: suggestions, isFetching } = useSuggestions();
  const [isOpen, setIsOpen] = useState(false);


  if (!isFetching && !suggestions.length) {
    return null;
  }

  return (
    <Stack space={4} className={`px-4 ${isOpen && 'pb-4'}`}>
      <HStack alignItems='center' justifyContent='between'>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='column.explorer.popular_accounts' defaultMessage={'Popular Accounts'} />
        </Text>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${ isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={() => setIsOpen(!isOpen)}
        />
      </HStack>

      <HStack className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'hidden max-h-0 opacity-0'}`}>
        <Swiper
          spaceBetween={10}
          slidesPerView={isMobile ? 2 : 3}
          grabCursor
          loop
          className='w-full'
        >
          {suggestions.map((suggestion) => (
            <SwiperSlide key={suggestion.account}>
              <PeopleToFollowCard id={suggestion.account} />
            </SwiperSlide>
          ))}
        </Swiper>
      </HStack>
    </Stack>
  );
};

export default AccountsCarousel;