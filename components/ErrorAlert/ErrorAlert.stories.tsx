import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ErrorAlert from './index'

export default {
  title: 'ErrorAlert',
  component: ErrorAlert,
} as ComponentMeta<typeof ErrorAlert>

const Template: ComponentStory<typeof ErrorAlert> = (args) => (
  <ErrorAlert {...args} />
)

export const SingleMessage = Template.bind({})

SingleMessage.args = {
  error: {
    error: 'Error Subject',
    message: 'Something bad happened.',
  },
}

export const MultipleMessages = Template.bind({})

MultipleMessages.args = {
  error: {
    error: 'Error Subject',
    message: ['Something bad happened.', 'Another bad thing happened.'],
  },
}
