import IconButton from '@mui/material/IconButton'
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined'
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { useRouter } from 'next/router'
import {
  StepIconProps,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material'
import { useAuthQuery } from '../../../../hooks/useApi'
import { styled } from '@mui/material/styles'

interface StepItemModel {
  key: number
  pathname: string
  label: string
}

const steps = [
  {
    key: 1,
    pathname: 'sweep-balances',
    label: 'Step 1',
  },
  {
    key: 2,
    pathname: 'tranche-sweeps',
    label: 'Step 2',
  },
  {
    key: 3,
    pathname: 'tranche-close',
    label: 'Step 3',
  },
  {
    key: 4,
    pathname: 'tranche-stats',
    label: 'Step 4',
  },
  {
    key: 5,
    pathname: 'complete',
    label: 'Step 5',
  },
] as StepItemModel[]

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 12px)',
    right: 'calc(50% + 12px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: 'black',
      opacity: 0.26,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#0366ff',
      opacity: 1,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: 'black',
    borderTopWidth: 3,
    borderRadius: 1,
    opacity: 0.26,
  },
}))

function OrderStepIcon(props: StepIconProps) {
  const { active, completed } = props

  return (
    <>
      {completed ? (
        <RadioButtonCheckedOutlinedIcon color="primary" />
      ) : (
        <RadioButtonUncheckedOutlinedIcon color="disabled" />
      )}
    </>
  )
}

export const StepIndicator = ({ disabled = true }: { disabled?: boolean }) => {
  const router = useRouter()
  const pathName = router.pathname.split('/')[3]
  const trancheId = router.query.slug

  const { data: providerTrancheSweeps, refetch } = useAuthQuery(
    `admin/vendor-to-aggregated/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  const { data: trancheStats } = useAuthQuery(
    `admin/tranche-stats/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  const { data: trancheTxs } = useAuthQuery(
    `admin/tranche-txs/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  const enableStep2 = Boolean(
    providerTrancheSweeps?.transactions &&
      providerTrancheSweeps?.transactions.length
  )

  const enableStep3 = providerTrancheSweeps?.enableProceedButton

  const enableStep4 = Boolean(trancheStats?.tranche_end)

  const enableStep5 = Boolean(
    trancheTxs?.transactions && trancheTxs?.transactions.length
  )

  const currentStep = steps.findIndex((step) => step.pathname === pathName) ?? 0
  const handleClick = (pathname: string, key: number) => {
    if (key === 2 && !enableStep2) {
      return
    }
    if (key === 3 && !enableStep3) {
      return
    }
    if (key === 4 && !enableStep4) {
      return
    }
    if (key === 5 && !enableStep5) {
      return
    }
    router.push(`/admin/tranche/${pathname}/${trancheId}`)
  }

  return (
    <>
      <Stepper
        activeStep={currentStep + 1}
        connector={<QontoConnector />}
        // orientation="horizontal"
        alternativeLabel
        className="w-full"
      >
        {steps.map((step) => (
          <Step
            className="cursor-pointer"
            key={step.key}
            onClick={() => handleClick(step.pathname, step.key)}
          >
            <StepLabel StepIconComponent={OrderStepIcon}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </>
  )
}
