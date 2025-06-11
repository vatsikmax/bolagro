import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const query = container.resolve("query")

  // Get order details
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "items.*",
      "shipping_address.*",
      "total",
      "subtotal",
      "shipping_total",
      "tax_total",
      "shipping_methods.*"
    ],
    filters: {
      id: data.id,
    },
  })

  // Send email notification
  await notificationModuleService.createNotifications({
    to: orders[0].email as string,
    channel: "email",
    template: "order-placed",
    data: {
      order: orders[0],
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}