import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';

import Icon from 'soapbox/components/icon';
import StatusContent from 'soapbox/components/status-content';
import { HStack, Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';

import Motion from '../../util/optional-motion';

import type { Menu, MenuItem } from 'soapbox/components/dropdown-menu';
import type { Status as StatusEntity } from 'soapbox/types/entities';

interface IActionsModal {
  status: StatusEntity,
  actions: Menu,
  onClick: () => void,
  onClose: () => void,
}

const ActionsModal: React.FC<IActionsModal> = ({ status, actions, onClick, onClose }) => {
  const renderAction = (action: MenuItem | null, i: number) => {
    if (action === null) {
      return <li key={`sep-${i}`} className='dropdown-menu__separator' />;
    }

    const { icon = null, text, meta = null, active = false, href = '#', isLogout, destructive } = action;

    const Comp = href === '#' ? 'button' : 'a';
    const compProps = href === '#' ? { onClick: onClick } : { href: href, rel: 'noopener' };

    return (
      <li key={`${text}-${i}`}>
        <HStack
          {...compProps}
          space={2.5}
          data-index={i}
          className={clsx('w-full', { active, destructive })}
          data-method={isLogout ? 'delete' : null}
          element={Comp}
        >
          {icon && <Icon title={text} src={icon} role='presentation' tabIndex={-1} />}
          <div>
            <div className={clsx({ 'actions-modal__item-label': !!meta })}>{text}</div>
            <div>{meta}</div>
          </div>
        </HStack>
      </li>
    );
  };

  return (
    <Motion defaultStyle={{ top: 100 }} style={{ top: spring(0) }}>
      {({ top }) => (
        <div className='modal-root__modal actions-modal' style={{ top: `${top}%` }}>
          {status && (
            <Stack space={2} className='border-b border-solid border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
              <AccountContainer
                key={status.account as string}
                id={status.account as string}
                showProfileHoverCard={false}
                withLinkToProfile={false}
                timestamp={status.created_at}
              />
              <StatusContent status={status} />
            </Stack>
          )}

          <ul className={clsx({ 'with-status': !!status })}>
            {actions && actions.map(renderAction)}

            <li className='dropdown-menu__separator' />

            <li>
              <button type='button' onClick={onClose}>
                <FormattedMessage id='lightbox.close' defaultMessage='Cancel' />
              </button>
            </li>
          </ul>
        </div>
      )}
    </Motion>
  );
};

export default ActionsModal;
