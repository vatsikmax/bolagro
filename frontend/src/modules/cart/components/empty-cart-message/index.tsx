import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

interface Dict {
  EmptyCartMessage: {
    cart: string
    empty: string
    exploreProducts: string
  }
}

const EmptyCartMessage = ({ dict }: { dict: Dict }) => {
  return (
    <div
      className="py-48 px-2 flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        {dict.EmptyCartMessage.cart}
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        {dict.EmptyCartMessage.empty}
      </Text>
      <div>
        <InteractiveLink href="/store">
          {dict.EmptyCartMessage.exploreProducts}
        </InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
