import { FC } from 'react'
import IconButton from '@mui/material/IconButton'
import CachedIcon from '@mui/icons-material/Cached'

interface PoktInfoProps {
  totalStaked: string | number
  poktPrice: string | number
  totalValue: string | number
  handleRefetch: () => void
}

const PoktInfo: FC<PoktInfoProps> = ({
  totalStaked,
  poktPrice,
  totalValue,
  handleRefetch,
}) => {
  return (
    <div className="px-8 py-10 relative rounded-xl bg-brand-blue-dark">
      <div className="mb-8">
        <p className="text-white my-0">Total Staked</p>
        <h1 className="text-white font-semibold text-4xl sm:text-5xl my-1 heading-number-tag">
          {totalStaked}
        </h1>
      </div>
      <div className="mb-8">
        <p className="text-white my-0">POKT Price</p>
        <h5 className="text-white font-semibold text-2xl my-1 heading-number-tag">
          {poktPrice}
        </h5>
      </div>
      <div>
        <p className="text-white my-0">Total USD Value</p>
        <h2 className="text-white text-3xl sm:text-4xl font-bold my-0 heading-number-tag">
          {totalValue}
        </h2>
      </div>
      <IconButton
        className="absolute top-2 right-2 text-white"
        onClick={handleRefetch}
      >
        <CachedIcon />
      </IconButton>
    </div>
  )
}

export default PoktInfo
