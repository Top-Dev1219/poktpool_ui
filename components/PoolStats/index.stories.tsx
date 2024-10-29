import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import PoolStats from './index'

export default {
  title: 'PoolStats',
  component: PoolStats,
} as ComponentMeta<typeof PoolStats>

export const Primary: ComponentStory<typeof PoolStats> = () => (
  <PoolStats totalMembers={224} totalStaked={3444000} />
)
