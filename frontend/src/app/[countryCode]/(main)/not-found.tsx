import { getDictionary } from "@lib/dictionary"
import InteractiveLink from "@modules/common/components/interactive-link"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default async function NotFound() {
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict: any = await getDictionary(lang as any)

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">
        {dict.NotFound.pageNotFound}
      </h1>
      <p className="text-small-regular text-ui-fg-base">
        {dict.NotFound.pageDoesNotExist}
      </p>
      <InteractiveLink href="/">{dict.NotFound.goToMain}</InteractiveLink>
    </div>
  )
}
