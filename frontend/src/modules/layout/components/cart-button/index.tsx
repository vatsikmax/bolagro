import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"
import { headers } from "next/headers"
import { getDictionary } from "@lib/dictionary"

export default async function CartButton() {
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict = await getDictionary(lang as any)

  const cart = await retrieveCart().catch(() => null)

  return <CartDropdown cart={cart} dict={dict} />
}
