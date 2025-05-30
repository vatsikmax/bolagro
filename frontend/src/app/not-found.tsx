import { getDictionary } from "@lib/dictionary"
import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"

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
      <Link className="flex gap-x-1 items-center group" href="/">
        <Text className="text-ui-fg-interactive">{dict.NotFound.goToMain}</Text>
        <ArrowUpRightMini
          className="group-hover:rotate-45 ease-in-out duration-150"
          color="var(--fg-interactive)"
        />
      </Link>
    </div>
  )
}
