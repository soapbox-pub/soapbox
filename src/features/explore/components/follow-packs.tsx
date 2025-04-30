import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import plusIcon from '@tabler/icons/outline/plus.svg';

// Nostr-related imports
import { nip19 } from 'nostr-tools';
import { useRelays } from 'soapbox/hooks/nostr/useBunker';

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
  const [followPacks, setFollowPacks] = useState<FollowPack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const relays = useRelays();

  useEffect(() => {
    const fetchFollowPacks = async () => {
      try {
        setIsLoading(true);
        
        // Connect to relays and fetch events
        const events = await Promise.all(relays.map(async (relay) => {
          try {
            const socket = new WebSocket(relay);
            
            return new Promise((resolve) => {
              const timeout = setTimeout(() => {
                socket.close();
                resolve([]);
              }, 5000);
              
              socket.onopen = () => {
                // Subscribe to follow pack events (kind 39089)
                const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;
                socket.send(JSON.stringify([
                  'REQ', 
                  requestId,
                  {
                    kinds: [39089],
                    limit: 10
                  }
                ]));
              };
              
              const events: any[] = [];
              
              socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message[0] === 'EVENT') {
                  events.push(message[2]);
                } else if (message[0] === 'EOSE') {
                  clearTimeout(timeout);
                  socket.close();
                  resolve(events);
                }
              };
              
              socket.onerror = () => {
                clearTimeout(timeout);
                socket.close();
                resolve([]);
              };
            });
          } catch (error) {
            return [];
          }
        }));
        
        // Process and deduplicate events
        const allEvents = events.flat();
        const uniqueEvents = allEvents.reduce((acc: any[], event: any) => {
          if (!acc.some(e => e.id === event.id)) {
            acc.push(event);
          }
          return acc;
        }, []);
        
        // Transform events into follow packs
        const packs = uniqueEvents.map((event: any) => {
          const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled Pack';
          const description = event.tags.find((tag: string[]) => tag[0] === 'description')?.[1];
          const image = event.tags.find((tag: string[]) => tag[0] === 'image')?.[1];
          
          // Extract user public keys from p tags
          const userPubkeys = event.tags
            .filter((tag: string[]) => tag[0] === 'p')
            .map((tag: string[]) => tag[1]);
          
          // For now, we'll just use the pubkeys as users
          // In a production app, we'd fetch profiles for these users
          const users = userPubkeys.map((pubkey: string) => ({
            pubkey,
            displayName: pubkey.substring(0, 8), // Simplified display name
          }));
          
          return {
            id: event.id,
            pubkey: event.pubkey,
            title,
            description,
            image,
            created_at: event.created_at,
            users,
          };
        });
        
        setFollowPacks(packs);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching follow packs:', error);
        setIsLoading(false);
      }
    };

    fetchFollowPacks();
  }, [relays]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <FormattedMessage id='follow_packs.title' defaultMessage='Follow Packs' />
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className='flex justify-center py-4'>
            <Text theme='muted'>
              <FormattedMessage id='follow_packs.loading' defaultMessage='Loading follow packs...' />
            </Text>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (followPacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <FormattedMessage id='follow_packs.title' defaultMessage='Follow Packs' />
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className='flex justify-center py-4'>
            <Text theme='muted'>
              <FormattedMessage id='follow_packs.empty' defaultMessage='No follow packs found' />
            </Text>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className='mb-4'>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='follow_packs.title' defaultMessage='Follow Packs' />
        </Text>
        <Text theme='muted'>
          <FormattedMessage id='follow_packs.subtitle' defaultMessage='Curated lists of users to follow' />
        </Text>
      </div>
      <div className='grid sm:grid-cols-1 md:grid-cols-2 gap-4'>
        {followPacks.map((pack) => (
          <FollowPackCard key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  );
};

export default FollowPacks;