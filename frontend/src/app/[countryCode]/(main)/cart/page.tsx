import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getDictionary } from "@lib/dictionary"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict = await getDictionary(lang as any)
  const cart = await retrieveCart()
  const customer = await retrieveCustomer()

  if (!cart) {
    return notFound()
  }

  return <CartTemplate cart={cart} customer={customer} dict={dict} />
}
