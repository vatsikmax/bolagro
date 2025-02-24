import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getDictionary } from "@lib/dictionary"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict = await getDictionary(lang as any)
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} dict={dict} />
    </div>
  )
}
