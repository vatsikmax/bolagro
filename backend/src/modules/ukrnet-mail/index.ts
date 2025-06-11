import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import UkrnetNotificationProviderService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [UkrnetNotificationProviderService],
})