import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import currency from 'currency.js'

export interface ProviderItemProps {
  providerName: string
  performance: string
  activenodes: string | number
  jailednodes: string | number
}

export const ProviderItem = (props: ProviderItemProps) => {
  const { providerName, performance, activenodes, jailednodes } = props
  return (
    <div className="py-2">
      <Typography className="my-1">
        Provider name: <Link className="ml-[66px]">{providerName}</Link>
      </Typography>
      <Typography className="my-1">
        Stake Balance:{' '}
        <span className="ml-[80px]">
          {performance &&
            currency(performance, {
              symbol: '',
              precision: 2,
            }).format()}
        </span>
      </Typography>
      <Typography className="my-1">
        # of nodes: <span className="ml-[100px]">{activenodes}</span>
      </Typography>
      <Typography className="my-1">
        # of jailed nodes: <span className="ml-[53px]">{jailednodes}</span>
      </Typography>
    </div>
  )
}
