import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Toast } from 'soapbox/components/ui';

export default {
  title: 'UI/Toast',
  component: Toast,
  argTypes: {
    t: { defaultValue: { visible: true, dismiss: () => {} }, table: { disable: true } },
    message: { type: 'string', defaultValue: 'Toast' },
    type: { defaultValue: 'success' },
    action: { table: { disable: true } },
  },
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = (args) => <Toast {...args} />;

export const Success = Template.bind({});
Success.args = {
  type: 'success',
};

export const Error = Template.bind({});
Error.args = {
  type: 'error',
};

export const Info = Template.bind({});
Info.args = {
  type: 'info',
};