const DROPDOWN_MENU_OPEN = 'DROPDOWN_MENU_OPEN';
const DROPDOWN_MENU_CLOSE = 'DROPDOWN_MENU_CLOSE';

const openDropdownMenu = () => ({ type: DROPDOWN_MENU_OPEN });
const closeDropdownMenu = () => ({ type: DROPDOWN_MENU_CLOSE });

export {
  DROPDOWN_MENU_OPEN,
  DROPDOWN_MENU_CLOSE,
  openDropdownMenu,
  closeDropdownMenu,
};
