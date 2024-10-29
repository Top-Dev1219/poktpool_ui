// StakeStatusQueue.stories.ts|tsx

import React from 'react'
import { v4 as uuid } from 'uuid'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import StakeStatusQueue from './index'

export default {
  title: 'StakeStatusQueue',
  component: StakeStatusQueue,
} as ComponentMeta<typeof StakeStatusQueue>

const Template: ComponentStory<typeof StakeStatusQueue> = (args) => (
  <StakeStatusQueue {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  queue: [
    // {
    //   stakeId: uuid(),
    //   user_uuid: uuid(),
    //   tx_id: 'FA73692F82C065B01515C0A949B156C067EF5FB4299D67396A53F42A39F07C55',
    //   status_code: 'TRANSACTION VERIFIED',
    //   timestamp: Date.now(),
    // },
    // {
    //   stakeId: uuid(),
    //   user_uuid: uuid(),
    //   tx_id: 'FA73692F82C065B01515C0A949B156C067EF5FB4299D67396A53F42A39F07C55',
    //   status_code: 'AWAITING STAKE',
    //   timestamp: Date.now(),
    // },
  ],
}
