import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import StillImage from 'soapbox/components/still-image';
import { Avatar, HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuLink, MenuList } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';

import type { Menu as MenuType } from 'soapbox/components/dropdown-menu';
import type { Group } from 'soapbox/types/entities';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeader {
  group?: Group | false | null,
}

const GroupHeader: React.FC<IGroupHeader> = ({ group }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const ownAccount = useOwnAccount();

  if (!group) {
    return (
      <div className='-mt-4 -mx-4'>
        <div>
          <div className='relative h-32 w-full lg:h-48 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='flex relative'>
              <div
                className='h-24 w-24 bg-gray-400 rounded-full ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onAvatarClick = () => {
    const avatar = normalizeAttachment({
      type: 'image',
      url: group.avatar,
    });
    dispatch(openModal('MEDIA', { media: ImmutableList.of(avatar), index: 0 }));
  };

  const handleAvatarClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAvatarClick();
    }
  };

  const onHeaderClick = () => {
    const header = normalizeAttachment({
      type: 'image',
      url: group.header,
    });
    dispatch(openModal('MEDIA', { media: ImmutableList.of(header), index: 0 }));
  };

  const handleHeaderClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onHeaderClick();
    }
  };

  const makeMenu = () => {
    const menu: MenuType = [];

    return menu;
  };

  const menu = makeMenu();

  return (
    <div className='-mt-4 -mx-4'>
      <div>
        <div className='relative flex flex-col justify-center h-32 w-full lg:h-48 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50 overflow-hidden isolate'>
          {group.header && (
            <a href={group.header} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={group.header}
                alt={intl.formatMessage(messages.header)}
              />
            </a>
          )}

          <div className='absolute top-2 left-2'>
            <HStack alignItems='center' space={1}>
              {/* {info} */}
            </HStack>
          </div>
        </div>
      </div>

      <div className='px-4 sm:px-6'>
        <HStack className='-mt-12' alignItems='bottom' space={5}>
          <div className='flex'>
            <a href={group.avatar} onClick={handleAvatarClick} target='_blank'>
              <Avatar
                src={group.avatar}
                size={96}
                className='relative h-24 w-24 rounded-full ring-4 ring-white dark:ring-primary-900'
              />
            </a>
          </div>

          <div className='mt-6 flex justify-end w-full sm:pb-1'>
            <HStack space={2} className='mt-10'>
              {ownAccount && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    src={require('@tabler/icons/dots.svg')}
                    theme='outlined'
                    className='px-2'
                    iconClassName='w-4 h-4'
                    children={null}
                  />

                  <MenuList className='w-56'>
                    {menu.map((menuItem, idx) => {
                      if (typeof menuItem?.text === 'undefined') {
                        return <MenuDivider key={idx} />;
                      } else {
                        const Comp = (menuItem.action ? MenuItem : MenuLink) as any;
                        const itemProps = menuItem.action ? { onSelect: menuItem.action } : { to: menuItem.to, as: Link, target: menuItem.newTab ? '_blank' : '_self' };

                        return (
                          <Comp key={idx} {...itemProps} className='group'>
                            <HStack space={3} alignItems='center'>
                              {menuItem.icon && (
                                <SvgIcon src={menuItem.icon} className='h-5 w-5 text-gray-400 flex-none group-hover:text-gray-500' />
                              )}

                              <div className='truncate'>{menuItem.text}</div>
                            </HStack>
                          </Comp>
                        );
                      }
                    })}
                  </MenuList>
                </Menu>
              )}
            </HStack>
          </div>
        </HStack>
      </div>
    </div>
  );
};

export default GroupHeader;
