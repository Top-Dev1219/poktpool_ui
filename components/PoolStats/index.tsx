import { FC } from 'react'
import CountUp from 'react-countup'
import { countUpProps } from '../../src/constants/countUp'

export type PoolStatsProps = {
  totalMembers: number
  totalStaked: number
}

export const PoolStats: FC<PoolStatsProps> = ({
  totalMembers,
  totalStaked,
}) => (
  <section className="mb-16 text-center">
    <div className="flex justify-around">
      <div>
        <div className="font-bold text-xl text-brand-blue-dark">
          <CountUp end={totalStaked} {...{ ...countUpProps, decimals: 2 }} />
        </div>
        <div>Total Staked</div>
      </div>
      <div>
        <div className="font-bold text-xl text-brand-blue-dark">
          <CountUp end={totalMembers} {...countUpProps} />
        </div>
        <div>Total Members</div>
      </div>
    </div>
  </section>
)
export default PoolStats
