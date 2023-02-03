import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import Button from 'soapbox/components/ui/button/button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    theme: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'accent',
        'danger',
        'transparent',
        'outline',
        'muted',
      ],
    },
  },
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  theme: 'primary',
  text: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  text: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'lg',
  text: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
  text: 'Button',
};
