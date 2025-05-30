import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  dict: any
  showStatus?: boolean
}

const OrderDetails = ({ order, dict, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <Text>
        {dict.OrderDetails.confirmationEmailMessage}{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        {dict.OrderDetails.orderDate}:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString(dict.locale)}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        {dict.OrderDetails.orderNumber}:{" "}
        <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              {dict.OrderDetails.orderStatus}:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {/* TODO: Check where the statuses should come from */}
                {/* {formatStatus(order.fulfillment_status)} */}
              </span>
            </Text>
            <Text>
              {dict.OrderDetails.paymentStatus}:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {/* {formatStatus(order.payment_status)} */}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
