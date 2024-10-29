import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import MaintenanceMode from './index'

export default {
  title: 'MaintenanceMode',
  component: MaintenanceMode,
} as ComponentMeta<typeof MaintenanceMode>

export const Primary: ComponentStory<typeof MaintenanceMode> = () => (
  <MaintenanceMode />
)
