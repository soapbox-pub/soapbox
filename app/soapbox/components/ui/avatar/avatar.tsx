import clsx from 'clsx';
import React from 'react';

import StillImage from 'soapbox/components/still-image';

const AVATAR_SIZE = 42;

interface IAvatar {
  /** URL to the avatar image. */
  src: string
  /** Width and height of the avatar in pixels. */
  size?: number
  /** Extra class names for the div surrounding the avatar image. */
  className?: string
}

/** Round profile avatar for accounts. */
const Avatar = (props: IAvatar) => {
  const { src, size = AVATAR_SIZE, className } = props;

  const style: React.CSSProperties = React.useMemo(() => ({
    width: size,
    height: size,
  }), [size]);

  return (
    <StillImage
      className={clsx('rounded-full', className)}
      style={style}
      src={src}
      alt='Avatar'
    />
  );
};

export { Avatar as default, AVATAR_SIZE };
