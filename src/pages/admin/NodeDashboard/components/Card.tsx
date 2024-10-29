import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

interface CardProps {
  label: string
  dataValue: string | number
  labelColor: string
}

export const Card = (props: CardProps) => {
  const { label, labelColor, dataValue } = props

  return (
    <Grid item xs={12} md={4} xl={3}>
      <Box
        className="bg-white rounded-lg p-6"
        sx={{ boxShadow: '0px 1px 30px rgba(0, 0, 0, 0.08)' }}
      >
        <Typography sx={{ color: labelColor }}>{label}</Typography>
        <Typography className="font-bold text-4xl break-words">
          {dataValue}
        </Typography>
      </Box>
    </Grid>
  )
}
