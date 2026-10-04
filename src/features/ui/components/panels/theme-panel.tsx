import { FormattedMessage } from 'react-intl';

import Widget from '@/components/ui/widget.tsx';

import ThemePicker from '../theme-picker.tsx';

/** Theme picker for logged-out visitors, who have no settings page. */
const ThemePanel: React.FC = () => (
  <Widget title={<FormattedMessage id='theme_panel.title' defaultMessage='Theme' />}>
    <ThemePicker />
  </Widget>
);

export default ThemePanel;
