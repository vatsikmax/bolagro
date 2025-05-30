import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { CapturePaymentInput, CapturePaymentOutput, AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, InitiatePaymentInput, InitiatePaymentOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, ProviderWebhookPayload, WebhookActionResult } from "@medusajs/types";
import { Logger } from "@medusajs/framework/types";

type Options = {
  apiKey: string
}

type InjectedDependencies = {
  logger: Logger
}


class LiqpayPaymentProviderService extends AbstractPaymentProvider<Options> {
  capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    throw new Error("Method not implemented.");
  }
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    throw new Error("Method not implemented.");
  }
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    throw new Error("Method not implemented.");
  }
  retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    throw new Error("Method not implemented.");
  }
  static identifier = "liqpay";

}

export default LiqpayPaymentProviderService
