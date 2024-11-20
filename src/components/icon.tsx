/**
 * Icon: abstract component to render SVG icons.
 * @module soapbox/components/icon
 */

import clsx from 'clsx';
import InlineSVG from 'react-inlinesvg'; // eslint-disable-line no-restricted-imports

export interface IIcon extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  id?: string;
  alt?: string;
  className?: string;
}

/**
 * @deprecated Use the UI Icon component directly.
 */
const Icon: React.FC<IIcon> = ({ src, alt, className, ...rest }) => {
  return (
    <div
      className={clsx('flex size-4 items-center justify-center transition duration-200', className)}
      {...rest}
    >
      <InlineSVG className='size-full transition duration-200' src={src} title={alt} loader={<></>} />
    </div>
  );
};

export default Icon;
