import photoOffIcon from '@tabler/icons/outline/photo-off.svg';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

import StillImage, { IStillImage } from 'soapbox/components/still-image.tsx';

import Icon from '../icon.tsx';

const AVATAR_SIZE = 42;

interface IAvatar extends Pick<IStillImage, 'src' | 'onError' | 'className'> {
  /** Width and height of the avatar in pixels. */
  size?: number;
}

/** Round profile avatar for accounts. */
const Avatar = (props: IAvatar) => {
  const { src, size = AVATAR_SIZE, className } = props;

  const [isAvatarMissing, setIsAvatarMissing] = useState<boolean>(false);

  const handleLoadFailure = () => setIsAvatarMissing(true);

  const style: React.CSSProperties = useMemo(() => ({
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
          src={photoOffIcon}
          className='size-4 text-gray-500 dark:text-gray-700'
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
