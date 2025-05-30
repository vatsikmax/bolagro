import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { headers } from "next/headers"
import { getDictionary } from "@lib/dictionary"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict: any = await getDictionary(lang as any)
  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} dict={dict} />
}
