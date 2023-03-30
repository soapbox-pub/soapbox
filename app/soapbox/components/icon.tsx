/**
 * Icon: abstact component to render SVG icons.
 * @module soapbox/components/icon
 */

import clsx from 'clsx';
import React from 'react';
import InlineSVG from 'react-inlinesvg'; // eslint-disable-line no-restricted-imports

export interface IIcon extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  id?: string
  alt?: string
  className?: string
}

/**
 * @deprecated Use the UI Icon component directly.
 */
const Icon: React.FC<IIcon> = ({ src, alt, className, ...rest }) => {
  return (
    <div
      className={clsx('svg-icon', className)}
      {...rest}
    >
      <InlineSVG src={src} title={alt} loader={<></>} />
    </div>
  );
};

export default Icon;
