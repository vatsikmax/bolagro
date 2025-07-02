"use client"

import { createContext } from "react"

type LiqpayWrapperProps = {
  children: React.ReactNode
}

export const LiqpayContext = createContext(false)

const LiqpayWrapper: React.FC<LiqpayWrapperProps> = ({ children }) => {
  return (
    <LiqpayContext.Provider value={true}>
      <div>{children}</div>
    </LiqpayContext.Provider>
  )
}

export default LiqpayWrapper
