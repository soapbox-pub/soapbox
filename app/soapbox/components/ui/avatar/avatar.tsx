import clsx from 'clsx';
import React, { useState } from 'react';

import StillImage, { IStillImage } from 'soapbox/components/still-image';

import Icon from '../icon/icon';

const AVATAR_SIZE = 42;

interface IAvatar extends Pick<IStillImage, 'src' | 'onError' | 'className'> {
  /** Width and height of the avatar in pixels. */
  size?: number
}

/** Round profile avatar for accounts. */
const Avatar = (props: IAvatar) => {
  const { src, size = AVATAR_SIZE, className } = props;

  const [isAvatarMissing, setIsAvatarMissing] = useState<boolean>(false);

  const handleLoadFailure = () => setIsAvatarMissing(true);

  const style: React.CSSProperties = React.useMemo(() => ({
    width: size,
    height: size,
  }), [size]);

  if (isAvatarMissing) {
    return (
      <div
        style={{
          width: size,
          height: size,
        }}
        className={clsx('flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-900', className)}
      >
        <Icon
          src={require('@tabler/icons/photo-off.svg')}
          className='h-4 w-4 text-gray-500 dark:text-gray-700'
        />
      </div>
    );
  }

  return (
    <StillImage
      className={clsx('rounded-full', className)}
      style={style}
      src={src}
      alt='Avatar'
      onError={handleLoadFailure}
    />
  );
};

export { Avatar as default, AVATAR_SIZE };
