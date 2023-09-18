import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';

import Icon from 'soapbox/components/icon';
import { HStack } from 'soapbox/components/ui';
import ReplyIndicator from 'soapbox/features/compose/components/reply-indicator';

import Motion from '../../util/optional-motion';

import type { Menu, MenuItem } from 'soapbox/components/dropdown-menu';
import type { Status as StatusEntity } from 'soapbox/types/entities';

interface IActionsModal {
  status: StatusEntity
  actions: Menu
  onClick: () => void
  onClose: () => void
}

const ActionsModal: React.FC<IActionsModal> = ({ status, actions, onClick, onClose }) => {
  const renderAction = (action: MenuItem | null, i: number) => {
    if (action === null) {
      return <li key={`sep-${i}`} className='dropdown-menu__separator' />;
    }

    const { icon = null, text, meta = null, active = false, href = '#', destructive } = action;

    const Comp = href === '#' ? 'button' : 'a';
    const compProps = href === '#' ? { onClick: onClick } : { href: href, rel: 'noopener' };

    return (
      <li key={`${text}-${i}`}>
        <HStack
          {...compProps}
          space={2.5}
          data-index={i}
          className={clsx('w-full', { active, destructive })}
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
            <ReplyIndicator className='actions-modal__status rounded-b-none' status={status} hideActions />
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
