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

// Mock data for development/testing - will show immediately while real data loads
const MOCK_FOLLOW_PACKS = [
  {
    id: '1',
    pubkey: 'pubkey1',
    title: 'Bitcoin Developers',
    description: 'Top Bitcoin developers and contributors',
    image: 'https://blog.lopp.net/content/images/2023/02/bitcoin-miner.jpeg',
    created_at: Date.now() / 1000,
    users: [
      { pubkey: 'p1', displayName: 'Adam Back' },
      { pubkey: 'p2', displayName: 'Jameson Lopp' },
      { pubkey: 'p3', displayName: 'Andreas M. Antonopoulos' },
      { pubkey: 'p4', displayName: 'Peter Todd' },
      { pubkey: 'p5', displayName: 'Elizabeth Stark' },
    ]
  },
  {
    id: '2',
    pubkey: 'pubkey2',
    title: 'Nostr Core Devs',
    description: 'Nostr protocol developers and implementers',
    image: 'https://nostr.com/assets/nostr-social.jpg',
    created_at: Date.now() / 1000 - 3600,
    users: [
      { pubkey: 'p6', displayName: 'fiatjaf' },
      { pubkey: 'p7', displayName: 'jb55' },
      { pubkey: 'p8', displayName: 'jack' },
      { pubkey: 'p9', displayName: 'hodlbod' },
    ]
  },
  {
    id: '3',
    pubkey: 'pubkey3',
    title: 'Bitcoin & Lightning Developers',
    description: 'People working on Bitcoin and Lightning',
    image: 'https://cdn.pixabay.com/photo/2022/01/30/13/33/crypto-6980327_1280.jpg',
    created_at: Date.now() / 1000 - 7200,
    users: [
      { pubkey: 'p10', displayName: 'roasbeef' },
      { pubkey: 'p11', displayName: 'ajtowns' },
      { pubkey: 'p12', displayName: 'suheb' },
    ]
  },
  {
    id: '4',
    pubkey: 'pubkey4',
    title: 'Privacy Tech Advocates',
    description: 'Developers and advocates for privacy technologies',
    image: 'https://cdn.pixabay.com/photo/2017/01/23/19/40/woman-2003647_960_720.jpg',
    created_at: Date.now() / 1000 - 10800,
    users: [
      { pubkey: 'p13', displayName: 'snowden' },
      { pubkey: 'p14', displayName: 'samourai' },
      { pubkey: 'p15', displayName: 'justanothergeek' },
      { pubkey: 'p16', displayName: 'privacydev' },
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
  users: FollowPackUser[];
}

const FollowPackCard: React.FC<{ pack: FollowPack }> = ({ pack }) => {
  const MAX_DISPLAYED_USERS = 3;

  return (
    <Card className='mb-4'>
      <CardBody>
        <Stack space={3}>
          {pack.image && (
            <div className='rounded-lg overflow-hidden'>
              <img src={pack.image} alt={pack.title} className='w-full h-32 object-cover' />
            </div>
          )}
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
            <HStack alignItems='center' space={1} className='text-primary-600 cursor-pointer'>
              <SvgIcon src={plusIcon} className='h-4 w-4' />
              <Text size='sm' weight='medium'>
                <FormattedMessage id='follow_packs.follow_all' defaultMessage='Follow all' />
              </Text>
            </HStack>
          </div>
        </Stack>
      </CardBody>
    </Card>
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