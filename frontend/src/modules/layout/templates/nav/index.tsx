import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { LocaleSwitcher } from "@modules/layout/components/locale-switcher"
import { getDictionary } from "@lib/dictionary"
import { headers } from "next/headers"
import ContactInfo from "@modules/layout/components/contact-info"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const headersList = await headers()
  const lang = headersList.get("x-language") || "ua" // Get language from middleware
  const dict = await getDictionary(lang as any)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 border-ui-border-base">
        <div className="relative z-10"></div>
        <nav className="content-container txt-xsmall-plus flex items-center">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} dict={dict} />
            </div>
          </div>
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase flex items-center"
              data-testid="nav-store-link"
            >
              {dict.Nav.name}
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="flex gap-3 py-5">
              <LocaleSwitcher />
            </div>
            <div>
              <ContactInfo />
            </div>
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                {dict.Nav.account}
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {dict.Nav.cart}
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
