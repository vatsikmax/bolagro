import { getDictionary } from "@lib/dictionary"
import SearchModal from "@modules/search/templates/search-modal"
import { headers } from "next/headers"

export default async function SearchModalRoute() {
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict: any = await getDictionary(lang as any)

  return <SearchModal dict={dict} />
}
