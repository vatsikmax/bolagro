import { Heading } from "@medusajs/ui"
import { headers, cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import { getDictionary } from "@lib/dictionary"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict = await getDictionary(lang as any)

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>{dict.OrderCompletedTemplate.thankYou}</span>
            <span>
              {dict.OrderCompletedTemplate.yourOrderWasPlacedSuccessfully}
            </span>
          </Heading>
          <OrderDetails order={order} dict={dict} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            {dict.OrderCompletedTemplate.summary}
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} dict={dict} />
          <ShippingDetails order={order} dict={dict} />
          <PaymentDetails order={order} dict={dict} />
          <Help dict={dict} />
        </div>
      </div>
    </div>
  )
}
