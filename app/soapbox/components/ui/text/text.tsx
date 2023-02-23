import clsx from 'clsx';
import React from 'react';

const themes = {
  default: 'text-gray-900 dark:text-gray-100',
  danger: 'text-danger-600',
  primary: 'text-primary-600 dark:text-accent-blue',
  muted: 'text-gray-700 dark:text-gray-600',
  subtle: 'text-gray-400 dark:text-gray-500',
  success: 'text-success-600',
  inherit: 'text-inherit',
  white: 'text-white',
};

const weights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base leading-5',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const alignments = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const trackingSizes = {
  normal: 'tracking-normal',
  wide: 'tracking-wide',
};

const transformProperties = {
  normal: 'normal-case',
  uppercase: 'uppercase',
};

const families = {
  sans: 'font-sans',
  mono: 'font-mono',
};

export type Sizes = keyof typeof sizes
type Tags = 'abbr' | 'p' | 'span' | 'pre' | 'time' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'div' | 'blockquote'
type Directions = 'ltr' | 'rtl'

interface IText extends Pick<React.HTMLAttributes<HTMLParagraphElement>, 'dangerouslySetInnerHTML' | 'tabIndex' | 'lang'> {
  /** Text content. */
  children?: React.ReactNode
  /** How to align the text. */
  align?: keyof typeof alignments
  /** Extra class names for the outer element. */
  className?: string
  /** Text direction. */
  direction?: Directions
  /** Typeface of the text. */
  family?: keyof typeof families
  /** The "for" attribute specifies which form element a label is bound to. */
  htmlFor?: string
  /** Font size of the text. */
  size?: Sizes
  /** HTML element name of the outer element. */
  tag?: Tags
  /** Theme for the text. */
  theme?: keyof typeof themes
  /** Letter-spacing of the text. */
  tracking?: keyof typeof trackingSizes
  /** Transform (eg uppercase) for the text. */
  transform?: keyof typeof transformProperties
  /** Whether to truncate the text if its container is too small. */
  truncate?: boolean
  /** Font weight of the text. */
  weight?: keyof typeof weights
  /** Tooltip title. */
  title?: string
}

/** UI-friendly text container with dark mode support. */
const Text = React.forwardRef<any, IText>(
  (props, ref) => {
    const {
      align,
      className,
      direction,
      family = 'sans',
      size = 'md',
      tag = 'p',
      theme = 'default',
      tracking = 'normal',
      transform = 'normal',
      truncate = false,
      weight = 'normal',
      ...filteredProps
    } = props;

    const Comp: React.ElementType = tag;

    const alignmentClass = typeof align === 'string' ? alignments[align] : '';

    return (
      <Comp
        {...filteredProps}
        ref={ref}
        style={{
          textDecoration: tag === 'abbr' ? 'underline dotted' : undefined,
          direction,
        }}
        className={clsx({
          'cursor-default': tag === 'abbr',
          truncate: truncate,
          [sizes[size]]: true,
          [themes[theme]]: true,
          [weights[weight]]: true,
          [trackingSizes[tracking]]: true,
          [families[family]]: true,
          [alignmentClass]: typeof align !== 'undefined',
          [transformProperties[transform]]: typeof transform !== 'undefined',
        }, className)}
      />
    );
  },
);

export {
  Text as default,
  IText,
};
