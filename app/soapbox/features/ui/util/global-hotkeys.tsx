import React, { useRef } from 'react';
import { HotKeys } from 'react-hotkeys';
import { useHistory } from 'react-router-dom';

import { resetCompose } from 'soapbox/actions/compose';
import { openModal } from 'soapbox/actions/modals';
import { FOCUS_EDITOR_COMMAND } from 'soapbox/features/compose/editor/plugins/focus-plugin';
import { useAppSelector, useAppDispatch, useOwnAccount, useSettings } from 'soapbox/hooks';

import type { LexicalEditor } from 'lexical';

const keyMap = {
  help: '?',
  new: 'n',
  search: ['s', '/'],
  forceNew: 'option+n',
  reply: 'r',
  favourite: 'f',
  react: 'e',
  boost: 'b',
  mention: 'm',
  open: ['enter', 'o'],
  openProfile: 'p',
  moveDown: ['down', 'j'],
  moveUp: ['up', 'k'],
  back: 'backspace',
  goToHome: 'g h',
  goToNotifications: 'g n',
  goToFavourites: 'g f',
  goToPinned: 'g p',
  goToProfile: 'g u',
  goToBlocked: 'g b',
  goToMuted: 'g m',
  goToRequests: 'g r',
  toggleHidden: 'x',
  toggleSensitive: 'h',
  openMedia: 'a',
};

interface IGlobalHotkeys {
  children: React.ReactNode
  node: React.MutableRefObject<HTMLDivElement | null>
}

const GlobalHotkeys: React.FC<IGlobalHotkeys> = ({ children, node }) => {
  const hotkeys = useRef<HTMLDivElement | null>(null);

  const history = useHistory();
  const dispatch = useAppDispatch();
  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const wysiwygEditor = useSettings().get('wysiwyg');

  const handleHotkeyNew = (e?: KeyboardEvent) => {
    e?.preventDefault();

    let element;

    if (wysiwygEditor) {
      element = node.current?.querySelector('div[data-lexical-editor="true"]') as HTMLTextAreaElement;
    } else {
      element = node.current?.querySelector('textarea#compose-textarea') as HTMLTextAreaElement;
    }

    if (element) {
      if (wysiwygEditor) {
        ((element as any).__lexicalEditor as LexicalEditor).dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
      } else {
        element.focus();
      }
    } else {
      dispatch(openModal('COMPOSE'));
    }
  };

  const handleHotkeySearch = (e?: KeyboardEvent) => {
    e?.preventDefault();
    if (!node.current) return;

    const element = node.current.querySelector('input#search') as HTMLInputElement;

    if (element) {
      element.focus();
    }
  };

  const handleHotkeyForceNew = (e?: KeyboardEvent) => {
    handleHotkeyNew(e);
    dispatch(resetCompose());
  };

  const handleHotkeyBack = () => {
    if (window.history && window.history.length === 1) {
      history.push('/');
    } else {
      history.goBack();
    }
  };

  const setHotkeysRef: React.LegacyRef<HotKeys> = (c: any) => {
    hotkeys.current = c;

    if (!me || !hotkeys.current) return;

    // @ts-ignore
    hotkeys.current.__mousetrap__.stopCallback = (_e, element) => {
      return ['TEXTAREA', 'SELECT', 'INPUT', 'EM-EMOJI-PICKER'].includes(element.tagName) || !!element.closest('[contenteditable]');
    };
  };

  const handleHotkeyToggleHelp = () => {
    dispatch(openModal('HOTKEYS'));
  };

  const handleHotkeyGoToHome = () => {
    history.push('/');
  };

  const handleHotkeyGoToNotifications = () => {
    history.push('/notifications');
  };

  const handleHotkeyGoToFavourites = () => {
    if (!account) return;
    history.push(`/@${account.username}/favorites`);
  };

  const handleHotkeyGoToPinned = () => {
    if (!account) return;
    history.push(`/@${account.username}/pins`);
  };

  const handleHotkeyGoToProfile = () => {
    if (!account) return;
    history.push(`/@${account.username}`);
  };

  const handleHotkeyGoToBlocked = () => {
    history.push('/blocks');
  };

  const handleHotkeyGoToMuted = () => {
    history.push('/mutes');
  };

  const handleHotkeyGoToRequests = () => {
    history.push('/follow_requests');
  };

  type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

  const handlers: HotkeyHandlers = {
    help: handleHotkeyToggleHelp,
    new: handleHotkeyNew,
    search: handleHotkeySearch,
    forceNew: handleHotkeyForceNew,
    back: handleHotkeyBack,
    goToHome: handleHotkeyGoToHome,
    goToNotifications: handleHotkeyGoToNotifications,
    goToFavourites: handleHotkeyGoToFavourites,
    goToPinned: handleHotkeyGoToPinned,
    goToProfile: handleHotkeyGoToProfile,
    goToBlocked: handleHotkeyGoToBlocked,
    goToMuted: handleHotkeyGoToMuted,
    goToRequests: handleHotkeyGoToRequests,
  };

  return (
    <HotKeys keyMap={keyMap} handlers={me ? handlers : undefined} ref={setHotkeysRef} attach={window} focused>
      {children}
    </HotKeys>
  );
};

export default GlobalHotkeys;
