import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import plusIcon from '@tabler/icons/outline/plus.svg';
import groupIcon from '@tabler/icons/outline/users.svg';
import React, { useEffect, useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Avatar from 'soapbox/components/ui/avatar.tsx';
import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';


// Define standard relays for production
const STANDARD_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://nostr.wine',
  'wss://relay.nostr.org',
];

interface FollowPackUser {
  pubkey: string;
  picture?: string;
  displayName?: string;
  name?: string;
  nip05?: string;
  loaded?: boolean;
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
  className = '',
}) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Default gradient background
  const gradientStyle = {
    background: 'linear-gradient(45deg, #6364ff, #563acc)',
  };

  const handleError = () => {
    setImgError(true);
    setIsImgLoaded(true);
  };

  const handleLoad = () => {
    setIsImgLoaded(true);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={imgError ? gradientStyle : {}}
    >
      {!isImgLoaded && (
        <div className='absolute inset-0 flex items-center justify-center bg-primary-100'>
          <Spinner size={20} />
        </div>
      )}

      {imgError ? (
        <div className='flex size-full items-center justify-center'>
          <SvgIcon src={groupIcon} className='size-12 text-white opacity-80' />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`size-full object-cover transition-opacity duration-300 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};

const FollowPackUserDisplay: React.FC<{ user: FollowPackUser; socket?: WebSocket }> = ({ user, socket }) => {
  const [profileData, setProfileData] = useState(user);
  const [isLoading, setIsLoading] = useState(!user.loaded);

  useEffect(() => {
    // Only fetch if we don't have profile data and have a socket
    if (!user.loaded && socket && socket.readyState === WebSocket.OPEN) {
      // Request metadata for this user
      const requestId = `req-user-${user.pubkey.substring(0, 6)}`;
      socket.send(JSON.stringify([
        'REQ',
        requestId,
        {
          kinds: [0], // Metadata events
          authors: [user.pubkey],
          limit: 1,
        },
      ]));

      // Listen for the response
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (data[0] === 'EVENT' && data[2]?.kind === 0 && data[2]?.pubkey === user.pubkey) {
            // We got a metadata event
            try {
              const content = JSON.parse(data[2].content);
              setProfileData(prev => ({
                ...prev,
                name: content.name,
                displayName: content.display_name || content.name,
                picture: content.picture,
                nip05: content.nip05,
                loaded: true,
              }));
              setIsLoading(false);
            } catch (e) {
              // Invalid JSON in content
              setIsLoading(false);
            }
          } else if (data[0] === 'EOSE' && data[1] === requestId) {
            // End of stored events - if we didn't get metadata, stop loading
            setIsLoading(false);
          }
        } catch (e) {
          // Parsing error
          setIsLoading(false);
        }
      };

      socket.addEventListener('message', handleMessage);

      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }

    return undefined;
  }, [user, socket]);

  return (
    <div className='flex items-center gap-1'>
      {isLoading ? (
        <>
          <div className='flex size-4 items-center justify-center rounded-full bg-gray-100 sm:size-5'>
            <Spinner size={10} />
          </div>
          <Text size='xs' className='sm:text-sm' theme='muted'>{user.pubkey.substring(0, 6)}</Text>
        </>
      ) : (
        <>
          <Avatar src={profileData.picture} size={16} className='sm:size-5' />
          <Text size='xs' className='sm:text-sm'>{profileData.displayName || profileData.name || user.pubkey.substring(0, 6)}</Text>
        </>
      )}
    </div>
  );
};

const FollowPackCard: React.FC<{ pack: FollowPack; metadataSocket?: WebSocket }> = ({ pack, metadataSocket }) => {
  const MAX_DISPLAYED_USERS = 3;

  // If the pack has a URL, render the card as a link to following.space
  const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (pack.url) {
      return (
        <a
          href={pack.url}
          target='_blank'
          rel='noopener noreferrer'
          className='block text-inherit no-underline'
        >
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card className='mb-3 max-w-full cursor-pointer overflow-hidden border border-primary-200 shadow-sm transition-shadow duration-200 hover:shadow-md sm:mb-4'>
        <CardBody className='p-0'>
          <Stack space={0}>
            <ImageWithFallback
              src={pack.image}
              alt={pack.title}
              className='h-24 w-full sm:h-28 md:h-32'
            />

            <div className='p-3 sm:p-4'>
              <Stack space={2} className='sm:space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='w-full overflow-hidden'>
                    <Text size='sm' weight='bold' className='line-clamp-1 sm:text-base md:text-lg'>{pack.title}</Text>
                    {pack.description && (
                      <Text theme='muted' size='xs' className='line-clamp-1 sm:text-sm'>{pack.description}</Text>
                    )}
                  </div>
                </div>

                <div>
                  <Text size='xs' theme='muted' className='mb-1 sm:mb-2 sm:text-sm'>
                    <FormattedMessage id='follow_packs.includes_users' defaultMessage='Includes' />
                  </Text>
                  <div className='flex flex-wrap gap-1 sm:gap-2'>
                    {pack.users.slice(0, MAX_DISPLAYED_USERS).map((user) => (
                      <FollowPackUserDisplay
                        key={user.pubkey}
                        user={user}
                        socket={metadataSocket}
                      />
                    ))}
                    {pack.users.length > MAX_DISPLAYED_USERS && (
                      <Text size='xs' theme='muted' className='sm:text-sm'>
                        <FormattedMessage
                          id='follow_packs.and_more'
                          defaultMessage='and {count} more'
                          values={{ count: pack.users.length - MAX_DISPLAYED_USERS }}
                        />
                      </Text>
                    )}
                  </div>
                </div>

                <div className='mt-1 flex justify-end'>
                  <HStack alignItems='center' space={1} className='cursor-pointer text-primary-600 hover:underline'>
                    <SvgIcon src={plusIcon} className='size-3 sm:size-4' />
                    <Text size='xs' weight='medium' className='sm:text-sm'>
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
  const [followPacks, setFollowPacks] = useState<FollowPack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(true);
  const activeConnections = useRef<WebSocket[]>([]);
  const metadataSocket = useRef<WebSocket | null>(null);
  const intl = useIntl();

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

  // Set up a dedicated socket for metadata
  useEffect(() => {
    // Clean up before creating a new one
    if (metadataSocket.current) {
      try {
        metadataSocket.current.close();
      } catch (e) { /* empty */ }
      metadataSocket.current = null;
    }

    // Create a new metadata socket
    const socket = new WebSocket('wss://relay.damus.io'); // Use a reliable relay for metadata
    metadataSocket.current = socket;

    return () => {
      if (metadataSocket.current) {
        try {
          metadataSocket.current.close();
        } catch (e) { /* empty */ }
        metadataSocket.current = null;
      }
    };
  }, []);

  // Production implementation for fetching from Nostr relays
  useEffect(() => {
    const fetchFollowPacks = async () => {
      try {
        setIsLoading(true);

        // Cleanup any existing connections
        activeConnections.current.forEach(socket => {
          try {
            socket.close();
          } catch (e) { /* empty */ }
        });
        activeConnections.current = [];

        const events: any[] = [];

        // Connect to relays and send subscription requests
        const subscriptions = STANDARD_RELAYS.map(relay => {
          return new Promise<void>((resolve) => {
            try {
              const socket = new WebSocket(relay);
              activeConnections.current.push(socket);

              const timeout = setTimeout(() => {
                try {
                  socket.close();
                } catch (e) { /* empty */ }
                resolve();
              }, 8000); // Longer timeout for production

              socket.onopen = () => {
                // Subscribe to follow pack events (kind 39089)
                const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;
                socket.send(JSON.stringify([
                  'REQ',
                  requestId,
                  {
                    kinds: [39089],
                    limit: 30,
                  },
                ]));
              };

              socket.onmessage = (message) => {
                try {
                  const data = JSON.parse(message.data);
                  if (data[0] === 'EVENT' && data[2]) {
                    events.push(data[2]);

                    // Process and update events in batches as they come in
                    if (events.length % 5 === 0) {
                      processAndUpdatePacks(events);
                    }
                  } else if (data[0] === 'EOSE') {
                    clearTimeout(timeout);
                    try {
                      socket.close();
                    } catch (e) { /* empty */ }
                    resolve();
                  }
                } catch (error) {
                  // Ignore parsing errors
                }
              };

              socket.onerror = () => {
                clearTimeout(timeout);
                resolve();
              };

              socket.onclose = () => {
                clearTimeout(timeout);
                resolve();
              };
            } catch (error) {
              resolve();
            }
          });
        });

        // Helper function to process and update packs
        const processAndUpdatePacks = (eventsToProcess: any[]) => {
          // Deduplicate events
          const uniqueEvents: any[] = [];
          const eventIds = new Set();

          for (const event of eventsToProcess) {
            if (!eventIds.has(event.id)) {
              eventIds.add(event.id);
              uniqueEvents.push(event);
            }
          }

          // Transform events into follow packs
          const packs = uniqueEvents
            .filter(event => {
              // Filter valid follow packs (must have title and at least 1 user)
              const hasTitle = event.tags.some((tag: string[]) => tag[0] === 'title');
              const hasUsers = event.tags.some((tag: string[]) => tag[0] === 'p');
              return hasTitle && hasUsers;
            })
            .map((event: any) => {
              // Extract data from tags according to the event format
              const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled Pack';
              const description = event.tags.find((tag: string[]) => tag[0] === 'description')?.[1];
              const image = event.tags.find((tag: string[]) => tag[0] === 'image')?.[1];
              const dTag = event.tags.find((tag: string[]) => tag[0] === 'd')?.[1];

              // Generate following.space URL if d tag exists
              const url = dTag ? `https://following.space/d/${dTag}` : undefined;

              // Extract user public keys from p tags
              const userPubkeys = event.tags
                .filter((tag: string[]) => tag[0] === 'p')
                .map((tag: string[]) => tag[1]);

              const users = userPubkeys.map((pubkey: string) => ({
                pubkey,
                // Extract nickname from the tag if available (NIP-02)
                displayName: event.tags.find((tag: string[]) =>
                  tag[0] === 'p' &&
                  tag[1] === pubkey &&
                  tag[3] === 'nick' &&
                  tag[2],
                )?.[2] || pubkey.substring(0, 8),
              }));

              return {
                id: event.id,
                pubkey: event.pubkey,
                title,
                description,
                image,
                created_at: event.created_at,
                url,
                users,
              };
            });

          // Sort by created_at (newest first)
          packs.sort((a, b) => b.created_at - a.created_at);

          if (packs.length > 0) {
            // Take max 4 packs to display as requested
            setFollowPacks(packs.slice(0, 4));
          }
        };

        // Wait for all relay subscriptions to complete
        await Promise.all(subscriptions);

        // Final processing of all events
        if (events.length > 0) {
          processAndUpdatePacks(events);
        }

        setIsLoading(false);

        // Cleanup connections
        activeConnections.current.forEach(socket => {
          try {
            socket.close();
          } catch (e) { /* empty */ }
        });
        activeConnections.current = [];
      } catch (error) {
        console.error('Error fetching follow packs:', error);
        setIsLoading(false);
      }
    };

    // Fetch data on component mount
    fetchFollowPacks();

    // Clean up on unmount
    return () => {
      activeConnections.current.forEach(socket => {
        try {
          socket.close();
        } catch (e) { /* empty */ }
      });
    };
  }, []);

  return (
    <Stack space={4} className='px-2 sm:px-4'>
      <HStack alignItems='center' justifyContent='between'>
        <Text size='lg' className='sm:text-xl' weight='bold'>
          <FormattedMessage id='follow_packs.title' defaultMessage='Follow Packs' />
        </Text>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={handleClick}
          aria-label={intl.formatMessage({
            id: isOpen ? 'follow_packs.collapse' : 'follow_packs.expand',
            defaultMessage: isOpen ? 'Collapse follow packs' : 'Expand follow packs',
          })}
        />
      </HStack>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'hidden max-h-0 opacity-0'}`}>
        {(() => {
          if (isLoading) {
            return (
              <div className='flex justify-center py-8'>
                <Spinner size={40} />
              </div>
            );
          }

          if (followPacks.length > 0) {
            return (
              <Stack space={4}>
                <div className='mx-auto grid w-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2'>
                  {followPacks.map((pack) => (
                    <div className='w-full max-w-full' key={pack.id}>
                      <FollowPackCard
                        pack={pack}
                        metadataSocket={metadataSocket.current || undefined}
                      />
                    </div>
                  ))}
                </div>

                <div className='mb-4 mt-2 flex justify-center'>
                  <a
                    href='https://following.space/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 sm:gap-2 sm:px-6 sm:py-3 sm:text-base'
                  >
                    <FormattedMessage id='follow_packs.explore_more' defaultMessage='Explore more Follow Packs' />
                    <SvgIcon src={arrowIcon} className='size-3 -rotate-90 sm:size-4' />
                  </a>
                </div>
              </Stack>
            );
          }

          return (
            <div className='flex flex-col items-center justify-center px-4 py-12 text-center'>
              <SvgIcon src={groupIcon} className='mb-4 size-12 text-gray-400' />
              <Text size='xl' weight='medium' className='mb-2'>
                <FormattedMessage id='follow_packs.no_packs' defaultMessage='No Follow Packs Found' />
              </Text>
              <Text theme='muted'>
                <FormattedMessage
                  id='follow_packs.empty_message'
                  defaultMessage='Follow Packs will appear here as they become available'
                />
              </Text>
              <a
                href='https://following.space'
                target='_blank'
                rel='noopener noreferrer'
                className='mt-4 text-primary-600 hover:underline'
              >
                <Text size='sm'>
                  <FormattedMessage
                    id='follow_packs.visit'
                    defaultMessage='Create a Follow Pack at following.space'
                  />
                </Text>
              </a>
            </div>
          );
        })()}
      </div>
    </Stack>
  );
};

export default FollowPacks;