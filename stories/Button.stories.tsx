import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Button } from 'soapbox/components/ui';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'UI/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    text: { type: 'string', defaultValue: 'Button' },
    theme: { defaultValue: 'primary' },
    size: { defaultValue: 'md' },
    disabled: { defaultValue: false },
    block: { defaultValue: false },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    type: { table: { disable: true } },
    to: { table: { disable: true } },
    icon: { table: { disable: true } },
    onClick: { table: { disable: true } },
  },
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  theme: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  theme: 'secondary',
};

export const Large = Template.bind({});
Large.args = {
  size: 'lg',
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
};
