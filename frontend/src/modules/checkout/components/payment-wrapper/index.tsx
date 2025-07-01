"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import { isLiqPay } from "@lib/constants"
import LiqpayWrapper from "./liqpay-wrapper"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  if (isLiqPay(paymentSession?.provider_id) && paymentSession) {
    return <LiqpayWrapper>{children}</LiqpayWrapper>
  } else {
    return <div>{children}</div>
  }
}

export default PaymentWrapper
