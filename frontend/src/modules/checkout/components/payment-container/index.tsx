import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isManual } from "@lib/constants"
import PaymentTest from "../payment-test"
import { LiqpayContext } from "../payment-wrapper/liqpay-wrapper"
import LiqPayEmbed from "../payment-wrapper/liqpay-embed"

const liqPayPaymentStatuses = {
  SUCCESS: "success",
  FAILURE: "failure",
  SANDBOX: "sandbox",
}

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const LiqPayWidgetContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  liqPayData,
  setLiqPayPaymentData,
}: Omit<PaymentContainerProps, "children"> & {
  liqPayData: any
  setLiqPayPaymentData: (data: any) => void
}) => {
  const liqPayReady = useContext(LiqpayContext)

  const hasValidData =
    liqPayData?.[0]?.data?.data && liqPayData?.[0]?.data?.signature

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId && (
        <>
          {liqPayReady && hasValidData ? (
            <LiqPayEmbed
              data={liqPayData?.[0]?.data.data}
              signature={liqPayData?.[0]?.data.signature}
              onCallback={(data) => {
                console.log("🔵LiqPay callback data:", data)
                if (data?.status === liqPayPaymentStatuses.SUCCESS) {
                  setLiqPayPaymentData(data)
                }
              }}
              onReady={() => {
                console.log("🟡LiqPay widget is ready")
              }}
              onClose={() => {
                console.log("🔴LiqPay widget closed")
              }}
            ></LiqPayEmbed>
          ) : (
            <div>
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ui-fg-base"></div>
              </div>
            </div>
          )}
        </>
      )}
    </PaymentContainer>
  )
}
