import React from 'react';

import Counter from '../counter/counter';

import SvgIcon from './svg-icon';

interface IIcon extends Pick<React.SVGAttributes<SVGAElement>, 'strokeWidth'> {
  /** Class name for the <svg> element. */
  className?: string
  /** Number to display a counter over the icon. */
  count?: number
  /** Optional max to cap count (ie: N+) */
  countMax?: number
  /** Tooltip text for the icon. */
  alt?: string
  /** URL to the svg icon. */
  src: string
  /** Width and height of the icon in pixels. */
  size?: number
  /** Override the data-testid */
  'data-testid'?: string
}

/** Renders and SVG icon with optional counter. */
const Icon: React.FC<IIcon> = ({ src, alt, count, size, countMax, ...filteredProps }): JSX.Element => (
  <div
    className='relative flex shrink-0 flex-col'
    data-testid={filteredProps['data-testid'] || 'icon'}
  >
    {count ? (
      <span className='absolute -right-3 -top-2 flex h-5 min-w-[20px] shrink-0 items-center justify-center whitespace-nowrap break-words'>
        <Counter count={count} countMax={countMax} />
      </span>
    ) : null}

    <SvgIcon src={src} size={size} alt={alt} {...filteredProps} />
  </div>
);

export default Icon;
