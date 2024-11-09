import { HotKeys as _HotKeys, type HotKeysProps } from '@mkljczk/react-hotkeys';
import { forwardRef } from 'react';

/**
 * Wrapper component around `react-hotkeys`.
 * `react-hotkeys` is a legacy component, so confining its import to one place is beneficial.
 */
const HotKeys = forwardRef<any, HotKeysProps>(({ children, ...rest }, ref) => (
  <_HotKeys {...rest} ref={ref}>
    {children}
  </_HotKeys>
));

export { HotKeys, type HotKeysProps as IHotKeys };