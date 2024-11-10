import arrowRightIcon from '@tabler/icons/outline/arrow-right.svg';

import HStack from 'soapbox/components/ui/hstack/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack/stack.tsx';
import Text from 'soapbox/components/ui/text/text.tsx';

interface IWidgetTitle {
  /** Title text for the widget. */
  title: React.ReactNode;
}

/** Title of a widget. */
const WidgetTitle = ({ title }: IWidgetTitle): JSX.Element => (
  <Text size='xl' weight='bold' tag='h1'>{title}</Text>
);

interface IWidgetBody {
  children: React.ReactNode;
}

/** Body of a widget. */
const WidgetBody: React.FC<IWidgetBody> = ({ children }): JSX.Element => (
  <Stack space={3}>{children}</Stack>
);

interface IWidget {
  /** Widget title text. */
  title: React.ReactNode;
  /** Callback when the widget action is clicked. */
  onActionClick?: () => void;
  /** URL to the svg icon for the widget action. */
  actionIcon?: string;
  /** Text for the action. */
  actionTitle?: string;
  action?: JSX.Element;
  children?: React.ReactNode;
}

/** Sidebar widget. */
const Widget: React.FC<IWidget> = ({
  title,
  children,
  onActionClick,
  actionIcon = arrowRightIcon,
  actionTitle,
  action,
}): JSX.Element => {
  return (
    <Stack space={4}>
      <HStack alignItems='center' justifyContent='between'>
        <WidgetTitle title={title} />
        {action || (onActionClick && (
          <IconButton
            className='ml-2 size-6 text-black dark:text-white rtl:rotate-180'
            src={actionIcon}
            onClick={onActionClick}
            title={actionTitle}
          />
        ))}
      </HStack>
      <WidgetBody>{children}</WidgetBody>
    </Stack>
  );
};

export default Widget;
