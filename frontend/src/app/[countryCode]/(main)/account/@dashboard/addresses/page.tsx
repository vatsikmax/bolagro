import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { headers } from "next/headers"
import { getDictionary } from "@lib/dictionary"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict = await getDictionary(lang as any)

  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">{dict.Addresses.shippingAddress}</h1>
        <p className="text-base-regular">{dict.Addresses.viewAndUpdate}</p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
