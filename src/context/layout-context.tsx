import React, { createContext, useState } from 'react'

interface ContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const initialState: ContextProps = {
  open: false,
  setOpen: () => undefined,
}

export const LayoutContext = createContext<ContextProps>(initialState)

export default function LayoutContextProvider({ children }: any) {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <LayoutContext.Provider value={{ open, setOpen }}>
      {children}
    </LayoutContext.Provider>
  )
}
