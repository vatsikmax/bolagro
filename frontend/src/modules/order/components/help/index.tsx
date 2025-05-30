import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = ({ dict }: { dict: any }) => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{dict.Help.needHelp}</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">
              {dict.Help.contact}
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              {dict.Help.returnAndExchanges}
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
