import * as React from 'react'
import Drawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

type CookieRejectType = {
  isOpen: boolean
  handleAcceptAll?: () => void
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

export const CookieConsentSetting = (props: CookieRejectType) => {
  const { isOpen, handleAcceptAll } = props
  const [expanded, setExpanded] = React.useState<string | false>('panel1')
  const [isSaving, setIsSaving] = React.useState(false)

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false)
    }

  const handlePrefSaving = () => {
    // just for providing users with visual indicator
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <>
      <Drawer anchor="bottom" open={isOpen}>
        <Accordion
          expanded={expanded === 'panel1'}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography>ESSENTIOAL COOKIES</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              These cookies are necessary to the core functionality of our
              website and some of its features, such as access to secure areas.
              This cannot be disabled.
            </Typography>
            <FormControlLabel
              disabled
              control={<Switch defaultChecked />}
              label="Activated"
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel2'}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
            <Typography>FUNCTIONAL COOKIES</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              These cookies are used to enhance the performance and
              functionality of our websites but are nonessential to their use.
              However, without these cookies, certain functionality may become
              unavailable.
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Activate"
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel3'}
          onChange={handleChange('panel3')}
        >
          <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <Typography>ANALYTICAL COOKIES</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              These cookies help us understand how our site is being used by
              tracking the number of visits and traffic sources. They enable us
              to customise and improve our site for you by allowing us to
              analyse how effective our marketing campaigns are. All information
              these cookies collect is aggregated and therefore, anonymous.
              De-selecting these cookies may result in less information for us
              to improve our site and user experience.
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Activate"
            />
          </AccordionDetails>
        </Accordion>
        <div className="block md:flex md:justify-end py-4 pl-2 pr-36">
          <Button variant="outlined" onClick={handlePrefSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button
            onClick={handleAcceptAll}
            variant="contained"
            className="mt-2 md:mt-0 md:ml-4"
          >
            ACCEPT ALL
          </Button>
          <Button
            variant="contained"
            onClick={handleAcceptAll}
            className="mt-2 md:mt-0 md:ml-4"
          >
            Accept only essentials
          </Button>
        </div>
      </Drawer>
    </>
  )
}
