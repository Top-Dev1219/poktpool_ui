import { Button, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import currency from 'currency.js'
import { format } from 'date-fns'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type PoktBalanceProps = {
  data: any[]
  onStartDateChange: (
    value: any,
    keyboardInputValue?: string | undefined
  ) => void
  onEndDateChange: (value: any, keyboardInputValue?: string | undefined) => void
  start: any
  end: any
  onClearDates: () => void
}

export default function PoktBalanceChart({
  data,
  onStartDateChange,
  onEndDateChange,
  onClearDates,
  start,
  end,
}: PoktBalanceProps) {
  const highestValue = Math.ceil(
    data.reduce(
      (highest, { staked_balance }) =>
        +staked_balance > highest ? +staked_balance : highest,
      0
    )
  )

  const getMax = () => {
    const zeroedOut = `${highestValue}`
      .split('.')[0]
      .slice(2)
      .split('')
      .map((x) => 0)
      .join('')

    const secodNumString = Number(String(highestValue)[1]) + 1

    if (secodNumString < 10) {
      const higher = Number(
        `${String(highestValue)[0]}${secodNumString}${zeroedOut}`
      )
      return +`${higher}`
    } else {
      const higher = Number(
        `${Number(String(highestValue)[0]) + 1}0${zeroedOut}`
      )
      return +`${higher}`
    }
  }

  return (
    <>
      <header className="flex justify-between mx-auto mb-4 items-center gap-4">
        <div className="items-center gap-4 mx-auto grid sm:grid-cols-[180px_180px_1fr]">
          <DatePicker
            label="Start Date"
            onChange={onStartDateChange}
            renderInput={(params) => <TextField size="small" {...params} />}
            value={start}
          />
          <DatePicker
            label="End Date"
            onChange={onEndDateChange}
            renderInput={(params) => <TextField size="small" {...params} />}
            value={end}
          />
          <Button onClick={onClearDates}>Clear Dates</Button>
        </div>
      </header>
      <ResponsiveContainer className="mx-auto mb-8" height={360}>
        <AreaChart
          margin={{ bottom: 16, left: 64, top: 32, right: 16 }}
          data={data}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0366ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#09d7fe" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="staked_balance"
            stroke="#0366ff"
            gradientTransform="#0366ff"
            fill="url(#colorUv)"
          />
          <Tooltip
            labelFormatter={(value) =>
              `${format(new Date(value), 'MMM d, yyyy')}`
            }
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white shadow p-4 text-center">
                    {format(new Date(label), 'MMM d, yyyy')}
                    <p className="m-0">
                      {`${currency(payload[0].value as string, {
                        symbol: '',
                      }).format()}`}{' '}
                      POKT
                    </p>
                  </div>
                )
              }

              return null
            }}
          />
          <XAxis
            angle={45 / 2}
            dataKey="as_of_date"
            tickFormatter={(value) =>
              value ? `${format(new Date(value), 'M/d/yy')}` : ''
            }
            tickMargin={16}
          />
          <YAxis
            dataKey="staked_balance"
            domain={[0, getMax()]}
            tickFormatter={(value) =>
              value
                ? currency(value, { precision: 0, symbol: '' }).format()
                : ''
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}
