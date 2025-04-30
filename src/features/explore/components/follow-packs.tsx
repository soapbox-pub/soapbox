import React, { useEffect, useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import plusIcon from '@tabler/icons/outline/plus.svg';
import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import groupIcon from '@tabler/icons/outline/users.svg';

// Updated mock data with reliable images and following.space URLs
const MOCK_FOLLOW_PACKS = [
  {
    id: '1',
    pubkey: 'pubkey1',
    title: 'Bitcoin Developers',
    description: 'Top Bitcoin developers and contributors',
    image: 'https://i.imgur.com/yoI8GmQ.png',
    created_at: Date.now() / 1000,
    url: 'https://following.space/d/acc8bfac-7b00-4c07-b607-d38b8e53bf0f',
    users: [
      { pubkey: 'p1', displayName: 'Adam Back', picture: 'https://i.imgur.com/JH9tJ3e.jpg' },
      { pubkey: 'p2', displayName: 'Jameson Lopp', picture: 'https://i.imgur.com/6GjQoRY.jpg' },
      { pubkey: 'p3', displayName: 'Andreas M. Antonopoulos', picture: 'https://i.imgur.com/nbDkVXA.jpg' },
      { pubkey: 'p4', displayName: 'Peter Todd', picture: 'https://i.imgur.com/TFhfpe4.jpg' },
      { pubkey: 'p5', displayName: 'Elizabeth Stark', picture: 'https://i.imgur.com/dYwHj8l.jpg' },
    ]
  },
  {
    id: '2',
    pubkey: 'pubkey2',
    title: 'Nostr Core Devs',
    description: 'Nostr protocol developers and implementers',
    image: 'https://i.imgur.com/o1uoEu5.jpg',
    created_at: Date.now() / 1000 - 3600,
    url: 'https://following.space/d/7209107c-3c8e-457e-b7a1-631hosdf8458',
    users: [
      { pubkey: 'p6', displayName: 'fiatjaf', picture: 'https://i.imgur.com/gslnOQx.jpg' },
      { pubkey: 'p7', displayName: 'jb55', picture: 'https://i.imgur.com/1HFhNsu.jpg' },
      { pubkey: 'p8', displayName: 'jack', picture: 'https://i.imgur.com/3w5JJdT.jpg' },
      { pubkey: 'p9', displayName: 'hodlbod', picture: 'https://i.imgur.com/N6YLPK0.jpg' },
    ]
  },
  {
    id: '3',
    pubkey: 'pubkey3',
    title: 'Bitcoin & Lightning Developers',
    description: 'People working on Bitcoin and Lightning',
    image: 'https://i.imgur.com/wjVuAGa.jpg',
    created_at: Date.now() / 1000 - 7200,
    url: 'https://following.space/d/964a52c8-f1c3-4eb9-a432-5a9e15as12af',
    users: [
      { pubkey: 'p10', displayName: 'roasbeef', picture: 'https://i.imgur.com/ZlJiWXB.jpg' },
      { pubkey: 'p11', displayName: 'ajtowns', picture: 'https://i.imgur.com/K3q3Xrm.jpg' },
      { pubkey: 'p12', displayName: 'suheb', picture: 'https://i.imgur.com/gYNLtmM.jpg' },
    ]
  },
  {
    id: '4',
    pubkey: 'pubkey4',
    title: 'Privacy Tech Advocates',
    description: 'Developers and advocates for privacy technologies',
    image: 'https://i.imgur.com/O3wHoYV.jpg',
    created_at: Date.now() / 1000 - 10800,
    url: 'https://following.space/d/6721453a-9db1-441b-88af-6d209ac458a1',
    users: [
      { pubkey: 'p13', displayName: 'snowden', picture: 'https://i.imgur.com/KXhZG3Z.jpg' },
      { pubkey: 'p14', displayName: 'samourai', picture: 'https://i.imgur.com/pWEsUgA.jpg' },
      { pubkey: 'p15', displayName: 'justanothergeek', picture: 'https://i.imgur.com/ENAsAWb.jpg' },
      { pubkey: 'p16', displayName: 'privacydev', picture: 'https://i.imgur.com/Q5QFPK0.jpg' },
    ]
  },
  {
    id: '5',
    pubkey: 'pubkey5',
    title: 'Cryptography Experts',
    description: 'Mathematicians and cryptography researchers',
    image: 'https://i.imgur.com/eSJzDVl.jpg',
    created_at: Date.now() / 1000 - 14400,
    url: 'https://following.space/d/8720a64b-34a1-42b1-9321-51dc6sdf9845',
    users: [
      { pubkey: 'p17', displayName: 'cryptograper1', picture: 'https://i.imgur.com/VHH2IHL.jpg' },
      { pubkey: 'p18', displayName: 'mathgeek', picture: 'https://i.imgur.com/zjl75cN.jpg' },
      { pubkey: 'p19', displayName: 'cryptolover', picture: 'https://i.imgur.com/RfkRGGZ.jpg' },
    ]
  },
  {
    id: '6',
    pubkey: 'pubkey6',
    title: 'FOSS Developers',
    description: 'Open source software contributors',
    image: 'https://i.imgur.com/8mRzUVR.jpg',
    created_at: Date.now() / 1000 - 18000,
    url: 'https://following.space/d/3d7a18c5-f1c3-489d-91a4-6fa9sdf8484',
    users: [
      { pubkey: 'p20', displayName: 'linuxdev', picture: 'https://i.imgur.com/Ua0AYtx.jpg' },
      { pubkey: 'p21', displayName: 'freecodedude', picture: 'https://i.imgur.com/pKgNH4m.jpg' },
      { pubkey: 'p22', displayName: 'opendoor', picture: 'https://i.imgur.com/gy2v0BC.jpg' },
      { pubkey: 'p23', displayName: 'freeas', picture: 'https://i.imgur.com/TkEUKZC.jpg' },
    ]
  },
];

interface FollowPackUser {
  pubkey: string;
  picture?: string;
  displayName?: string;
}

interface FollowPack {
  id: string;
  pubkey: string;
  title: string;
  description?: string;
  image?: string;
  created_at: number;
  url?: string;
  users: FollowPackUser[];
}

const ImageWithFallback: React.FC<{ src?: string; alt: string; className?: string }> = ({ 
  src, 
  alt,
  className = '' 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Default gradient background
  const gradientStyle = {
    background: 'linear-gradient(45deg, #6364ff, #563acc)',
  };

  const handleError = () => {
    setImgError(true);
    setImgLoaded(true);
  };

  const handleLoad = () => {
    setImgLoaded(true);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={imgError ? gradientStyle : {}}
    >
      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-100">
          <Spinner size={20} />
        </div>
      )}
      
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center">
          <SvgIcon src={groupIcon} className="h-12 w-12 text-white opacity-80" />
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};

const FollowPackCard: React.FC<{ pack: FollowPack }> = ({ pack }) => {
  const MAX_DISPLAYED_USERS = 3;

  // If the pack has a URL, render the card as a link to following.space
  const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (pack.url) {
      return (
        <a 
          href={pack.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block no-underline text-inherit"
        >
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card className='mb-4 overflow-hidden border border-primary-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer'>
        <CardBody className="p-0">
          <Stack space={0}>
            <ImageWithFallback 
              src={pack.image} 
              alt={pack.title} 
              className='w-full h-32' 
            />
            
            <div className="p-4">
              <Stack space={3}>
                <div className='flex items-center justify-between'>
                  <div>
                    <Text size='lg' weight='bold'>{pack.title}</Text>
                    {pack.description && (
                      <Text theme='muted' truncate>{pack.description}</Text>
                    )}
                  </div>
                </div>
                
                <div>
                  <Text size='sm' theme='muted' className='mb-2'>
                    <FormattedMessage id='follow_packs.includes_users' defaultMessage='Includes' />
                  </Text>
                  <div className='flex flex-wrap gap-2'>
                    {pack.users.slice(0, MAX_DISPLAYED_USERS).map((user) => (
                      <div key={user.pubkey} className='flex items-center gap-1'>
                        <Avatar src={user.picture} size={20} />
                        <Text size='sm'>{user.displayName || user.pubkey.substring(0, 8)}</Text>
                      </div>
                    ))}
                    {pack.users.length > MAX_DISPLAYED_USERS && (
                      <Text size='sm' theme='muted'>
                        <FormattedMessage 
                          id='follow_packs.and_more' 
                          defaultMessage='and {count} more' 
                          values={{ count: pack.users.length - MAX_DISPLAYED_USERS }} 
                        />
                      </Text>
                    )}
                  </div>
                </div>
                
                <div className='flex justify-end'>
                  <HStack alignItems='center' space={1} className='text-primary-600 cursor-pointer hover:underline'>
                    <SvgIcon src={plusIcon} className='h-4 w-4' />
                    <Text size='sm' weight='medium'>
                      <FormattedMessage id='follow_packs.follow_all' defaultMessage='Follow all' />
                    </Text>
                  </HStack>
                </div>
              </Stack>
            </div>
          </Stack>
        </CardBody>
      </Card>
    </CardWrapper>
  );
};

const FollowPacks: React.FC = () => {
  // Start with mock data for immediate display
  const [followPacks, setFollowPacks] = useState<FollowPack[]>(MOCK_FOLLOW_PACKS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(true);
  
  // Load isOpen state from localStorage on mount
  useEffect(() => {
    const isOpenStatus = localStorage.getItem('soapbox:explore:followpacks:status');
    if (isOpenStatus) {
      setIsOpen(JSON.parse(isOpenStatus));
    }
  }, []);

  const handleClick = () => {
    setIsOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem('soapbox:explore:followpacks:status', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Simplified fetch - in practice you would uncomment this to fetch real data
  /*
  useEffect(() => {
    const fetchFollowPacks = async () => {
      try {
        // Fetch from a Nostr API or relay
        // For now, we're using the mocked data
      } catch (error) {
        console.error('Error fetching follow packs:', error);
      }
    };

    fetchFollowPacks();
  }, []);
  */

  return (
    <Stack space={4} className='px-4'>
      <HStack alignItems='center' justifyContent='between'>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='follow_packs.title' defaultMessage='Follow Packs' />
        </Text>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={handleClick}
          aria-label={isOpen ? 
            'Collapse follow packs' : 
            'Expand follow packs'
          }
        />
      </HStack>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'hidden max-h-0 opacity-0'}`}>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <Spinner size={40} />
          </div>
        ) : (
          <div className='grid sm:grid-cols-1 md:grid-cols-2 gap-4'>
            {followPacks.map((pack) => (
              <FollowPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        )}
      </div>
    </Stack>
  );
};

export default FollowPacks;