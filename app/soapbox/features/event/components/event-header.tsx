import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchEventIcs } from 'soapbox/actions/events';
import { openModal } from 'soapbox/actions/modals';
import Icon from 'soapbox/components/icon';
import StillImage from 'soapbox/components/still_image';
import { HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuLink, MenuList, Stack, Text } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { download } from 'soapbox/utils/download';

import PlaceholderEventHeader from '../../placeholder/components/placeholder_event_header';
import EventActionButton from '../components/event-action-button';
import EventDate from '../components/event-date';

import type { Menu as MenuType } from 'soapbox/components/dropdown_menu';
import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  bannerHeader: { id: 'event.banner', defaultMessage: 'Event banner' },
  exportIcs: { id: 'event.export_ics', defaultMessage: 'Export to your calendar' },
  copy: { id: 'event.copy', defaultMessage: 'Copy link to event' },
});

interface IEventHeader {
  status?: StatusEntity,
}

const EventHeader: React.FC<IEventHeader> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);

  if (!status || !status.event) {
    return (
      <>
        <div className='-mt-4 -mx-4'>
          <div className='relative h-48 w-full lg:h-64 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50' />
        </div>

        <PlaceholderEventHeader />
      </>
    );
  }

  const account = status.account as AccountEntity;
  const event = status.event;
  const banner = status.media_attachments?.find(({ description }) => description === 'Banner');

  const handleHeaderClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();

    const index = status.media_attachments!.findIndex(({ description }) => description === 'Banner');
    dispatch(openModal('MEDIA', { media: status.media_attachments, index }));
  };

  const handleExportClick: React.MouseEventHandler = e => {
    dispatch(fetchEventIcs(status.id)).then((response) => {
      download(response, 'calendar.ics');
    }).catch(() => {});
    e.preventDefault();
  };

  const menu: MenuType = [
    {
      text: intl.formatMessage(messages.exportIcs),
      action: handleExportClick,
      icon: require('@tabler/icons/calendar-plus.svg'),
    },
  ];

  return (
    <>
      <div className='-mt-4 -mx-4'>
        <div className='relative h-48 w-full lg:h-64 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50'>
          {banner && (
            <a href={banner.url} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={banner.url}
                alt={intl.formatMessage(messages.bannerHeader)}
                className='absolute inset-0 object-cover md:rounded-t-xl'
              />
            </a>
          )}
        </div>
      </div>
      <Stack space={2}>
        <HStack className='w-full' alignItems='start' space={2}>
          <Text className='flex-grow' size='lg' weight='bold'>{event.name}</Text>
          <Menu>
            <MenuButton
              as={IconButton}
              src={require('@tabler/icons/dots.svg')}
              theme='outlined'
              className='px-2 h-[30px]'
              iconClassName='w-4 h-4'
              children={null}
            />

            <MenuList>
              {menu.map((menuItem, idx) => {
                if (typeof menuItem?.text === 'undefined') {
                  return <MenuDivider key={idx} />;
                } else {
                  const Comp = (menuItem.action ? MenuItem : MenuLink) as any;
                  const itemProps = menuItem.action ? { onSelect: menuItem.action } : { to: menuItem.to, as: Link, target: menuItem.newTab ? '_blank' : '_self' };

                  return (
                    <Comp key={idx} {...itemProps} className='group'>
                      <div className='flex items-center'>
                        {menuItem.icon && (
                          <SvgIcon src={menuItem.icon} className='mr-3 h-5 w-5 text-gray-400 flex-none group-hover:text-gray-500' />
                        )}

                        <div className='truncate'>{menuItem.text}</div>
                      </div>
                    </Comp>
                  );
                }
              })}
            </MenuList>
          </Menu>
          {account.id !== me && <EventActionButton status={status} />}
        </HStack>

        <Stack space={1}>
          <HStack alignItems='center' space={2}>
            <Icon src={require('@tabler/icons/user.svg')} />
            <span>
              <FormattedMessage
                id='event.organized_by'
                defaultMessage='Organized by {name}'
                values={{
                  name: (
                    <Link className='mention' to={`/@${account.acct}`}>
                      <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />
                      {account.verified && <VerificationBadge />}
                    </Link>
                  ),
                }}
              />
            </span>
          </HStack>

          <EventDate status={status} />

          {event.location && (
            <HStack alignItems='center' space={2}>
              <Icon src={require('@tabler/icons/map-pin.svg')} />
              <span>
                {event.location.get('name')}
              </span>
            </HStack>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default EventHeader;
