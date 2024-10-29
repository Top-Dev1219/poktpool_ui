import * as React from 'react'
import clsx from 'clsx'
import { useButton } from '@mui/base'
import { styled } from '@mui/system'
import { Button, ButtonProps, CircularProgress } from '@mui/material'

const CustomButtonRoot = styled(Button)`
  &[type='submit'],
  &[type='button'] {
    background-image: linear-gradient(to top right, #0366ff, #09d7fe);
    text-shadow: 2px 0px 6px #0366ff;
    color: #fff;

    &:hover {
      background-color: #0059b2;
    }

    &.active {
      background-color: #004386;
    }
  }
`

const CustomButton: React.FC<
  ButtonProps & { gradient?: boolean; isLoading?: boolean }
> = React.forwardRef(function CustomButton(props, ref) {
  const { children, gradient, isLoading = false } = props
  const { active, disabled, focusVisible, getRootProps } = useButton({
    ...props,
    ref,
  })

  const classes = {
    active,
    disabled,
    focusVisible,
  }

  return gradient ? (
    <CustomButtonRoot
      {...getRootProps()}
      className={clsx(classes)}
      size={props?.size}
    >
      {children}
    </CustomButtonRoot>
  ) : (
    <Button {...props} className={clsx(classes)} disabled={isLoading}>
      {isLoading ? <CircularProgress size={28} color="inherit" /> : children}
    </Button>
  )
})

export default CustomButton
