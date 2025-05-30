"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
  dict: any
}

const sortOptions = [
  {
    value: "created_at",
    label: "latestArrivals",
  },
  {
    value: "price_asc",
    label: "priceLowToHigh",
  },
  {
    value: "price_desc",
    label: "priceHighToLow",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
  dict,
}: SortProductsProps) => {
  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  return (
    <FilterRadioGroup
      title={dict.SortProducts.sortBy}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
      dict={dict}
    />
  )
}

export default SortProducts
