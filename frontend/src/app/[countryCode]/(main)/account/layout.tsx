import { retrieveCustomer } from "@lib/data/customer"
import { getDictionary } from "@lib/dictionary"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"
import { headers } from "next/headers"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict: any = await getDictionary(lang as any)
  return (
    <AccountLayout customer={customer} dict={dict}>
      {customer ? dashboard : login}
      <Toaster />
    </AccountLayout>
  )
}
