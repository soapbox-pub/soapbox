import clsx from 'clsx';

const themes = {
  primary:
    'bg-primary-500 hover:bg-primary-400 dark:hover:bg-primary-600 border-transparent focus:bg-primary-500 text-gray-100 focus:ring-primary-300',
  secondary:
    'border-transparent bg-primary-100 dark:bg-primary-800 hover:bg-primary-50 dark:hover:bg-primary-700 focus:bg-primary-100 dark:focus:bg-primary-800 text-primary-500 dark:text-primary-200',
  tertiary:
    'bg-transparent border-gray-400 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 text-gray-900 dark:text-gray-100 focus:ring-primary-500',
  accent: 'border-transparent bg-secondary-500 hover:bg-secondary-400 focus:bg-secondary-500 text-gray-100 focus:ring-secondary-300',
  danger: 'border-transparent bg-danger-100 dark:bg-danger-900 text-danger-600 dark:text-danger-200 hover:bg-danger-600 hover:text-gray-100 dark:hover:text-gray-100 dark:hover:bg-danger-500 focus:ring-danger-500',
  transparent: 'border-transparent bg-transparent text-primary-600 dark:text-accent-blue dark:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800/50',
  outline: 'border-gray-100 border-2 bg-transparent text-gray-100 hover:bg-white/10',
  muted: 'border border-solid bg-transparent border-gray-400 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 text-gray-900 dark:text-gray-100 focus:ring-primary-500',
};

const sizes = {
  xs: 'px-3 py-1 text-xs',
  sm: 'px-3 py-1.5 text-xs leading-4',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

type ButtonSizes = keyof typeof sizes
type ButtonThemes = keyof typeof themes

type IButtonStyles = {
  theme: ButtonThemes
  block: boolean
  disabled: boolean
  size: ButtonSizes
}

/** Provides class names for the <Button> component. */
const useButtonStyles = ({
  theme,
  block,
  disabled,
  size,
}: IButtonStyles) => {
  const buttonStyle = clsx({
    'inline-flex items-center place-content-center border font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none transition-all': true,
    'select-none disabled:opacity-75 disabled:cursor-default': disabled,
    [`${themes[theme]}`]: true,
    [`${sizes[size]}`]: true,
    'flex w-full justify-center': block,
  });

  return buttonStyle;
};

export { useButtonStyles, ButtonSizes, ButtonThemes };
