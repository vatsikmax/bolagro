"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  dict: any
}

const ProductTabs = ({ product, dict }: ProductTabsProps) => {
  const tabs = [
    {
      label: dict.ProductTabs.productInformation,
      component: <ProductInfoTab product={product} dict={dict} />,
    },
    {
      label: dict.ProductTabs.shippingAndReturns,
      component: <ShippingInfoTab dict={dict} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product, dict }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">
              {dict.ProductInfoTab.material}
            </span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">
              {dict.ProductInfoTab.countryOfOrigin}
            </span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{dict.ProductInfoTab.type}</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{dict.ProductInfoTab.weight}</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">
              {dict.ProductInfoTab.dimensions}
            </span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = ({ dict }: { dict: any }) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">
              {dict.ShippingInfoTab.fastDelivery}
            </span>
            <p className="max-w-sm">
              {dict.ShippingInfoTab.fastDeliveryDescription}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">
              {dict.ShippingInfoTab.simpleExchanges}
            </span>
            <p className="max-w-sm">
              {dict.ShippingInfoTab.simpleExchangesDescription}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">
              {dict.ShippingInfoTab.easyReturns}
            </span>
            <p className="max-w-sm">
              {dict.ShippingInfoTab.easyReturnsDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
