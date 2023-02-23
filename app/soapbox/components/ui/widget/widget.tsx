import React from 'react';

import { HStack, IconButton, Stack, Text } from 'soapbox/components/ui';

interface IWidgetTitle {
  /** Title text for the widget. */
  title: React.ReactNode
}

/** Title of a widget. */
const WidgetTitle = ({ title }: IWidgetTitle): JSX.Element => (
  <Text size='xl' weight='bold' tag='h1'>{title}</Text>
);

interface IWidgetBody {
  children: React.ReactNode
}

/** Body of a widget. */
const WidgetBody: React.FC<IWidgetBody> = ({ children }): JSX.Element => (
  <Stack space={3}>{children}</Stack>
);

interface IWidget {
  /** Widget title text. */
  title: React.ReactNode
  /** Callback when the widget action is clicked. */
  onActionClick?: () => void
  /** URL to the svg icon for the widget action. */
  actionIcon?: string
  /** Text for the action. */
  actionTitle?: string
  action?: JSX.Element
  children?: React.ReactNode
}

/** Sidebar widget. */
const Widget: React.FC<IWidget> = ({
  title,
  children,
  onActionClick,
  actionIcon = require('@tabler/icons/arrow-right.svg'),
  actionTitle,
  action,
}): JSX.Element => {
  return (
    <Stack space={4}>
      <HStack alignItems='center' justifyContent='between'>
        <WidgetTitle title={title} />
        {action || (onActionClick && (
          <IconButton
            className='ml-2 h-6 w-6 text-black rtl:rotate-180 dark:text-white'
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
