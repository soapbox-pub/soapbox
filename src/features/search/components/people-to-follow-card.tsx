import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useAccount } from 'soapbox/api/hooks/index.ts';
import { InstanceFavicon } from 'soapbox/components/account.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import ActionButton from 'soapbox/features/ui/components/action-button.tsx';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import {
  // useDismissSuggestion,
  useSuggestions,
} from 'soapbox/queries/suggestions.ts';

import 'swiper/css';

// Delete
const lightenColor = (rgb: string, percent: number) => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return '#888888';

  let r = parseInt(match[1]);
  let g = parseInt(match[2]);
  let b = parseInt(match[3]);

  r = Math.min(255, r + (255 - r) * percent / 100);
  g = Math.min(255, g + (255 - g) * percent / 100);
  b = Math.min(255, b + (255 - b) * percent / 100);

  return `rgb(${r}, ${g}, ${b})`;
};

// Delete
const getFaviconColor = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return resolve('#888888');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => resolve('#888888');
  });
};


const PeopleToFollowCard = ({ id }: { id: string }) => {
  const account = useAccount(id).account;
  const { logo } = useSoapboxConfig();
  const [bgColor, setBgColor] = useState<string>('#888888');

  useEffect(() => {
    if (account?.pleroma?.favicon) {
      getFaviconColor(account.pleroma.favicon).then((color) => {
        setBgColor(lightenColor(color, 0));
      }).catch(() => setBgColor('#888888'));
    }
  }, [account?.pleroma?.favicon]);

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
              alignItems='center' space={1} className='max-w-28 rounded-full border px-2 py-0.5 !text-white' style={{
                backgroundColor: bgColor,
                borderColor: bgColor,
              }}
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
  // const dismissSuggestion = useDismissSuggestion();

  // const handleDismiss = (account: AccountEntity) => {
  //   dismissSuggestion.mutate(account.id);
  // };

  if (!isFetching && !suggestions.length) {
    return null;
  }

  return (
    <Stack space={4}>
      <HStack className='px-4'>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='column.explorer.popular_accounts' defaultMessage={'Popular Accounts'} />
        </Text>
      </HStack>

      <HStack className='overflow-hidden px-4 '>
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