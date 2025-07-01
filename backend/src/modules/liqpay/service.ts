import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { CapturePaymentInput, CapturePaymentOutput, AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, InitiatePaymentInput, InitiatePaymentOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, ProviderWebhookPayload, WebhookActionResult } from "@medusajs/types"
const crypto = require("crypto");

type LiqPayOptions = {
  privateKey: string
}

class LiqPayClient {
  constructor(public address = 'https://www.liqpay.ua/api/request') { }

  base64Encode(str) {
    return Buffer.from(str).toString("base64");
  }

  generateSignature(privateKey, data) {
    return this.base64Encode(
      crypto.createHash("sha1")
        .update(privateKey + data + privateKey)
        .digest()
    );
  }

  generateData(publicKey, params) {
    return this.base64Encode(JSON.stringify({
      public_key: publicKey,
      ...params,
    }));
  }
}

const paymentParams = {
  version: "3",
};

class LiqPayPaymentProviderService extends AbstractPaymentProvider<LiqPayOptions> {
  liqPayClient: LiqPayClient = new LiqPayClient();
  options: LiqPayOptions;

  capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return Promise.resolve({ data: input.data, status: "captured" });
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    input.data?.order_id
    const params = {
      ...paymentParams,
      action: "status",
      order_id: input.data?.order_id as string,
    }
    const data = this.liqPayClient.generateData(input.data?.liqPayPublicKey, params);
    const signature = this.liqPayClient.generateSignature(this.options.privateKey, data);
    const paymentStatusResponse = await fetch(this.liqPayClient.address, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ data, signature }).toString(),
    });
    const responseStatusData = await paymentStatusResponse.json();
    if (responseStatusData.status === "success") {
      await this.capturePayment(input);
      return {
        data: { ...input.data, payment: responseStatusData },
        status: "captured", // Assuming capture is always successful
      }
    } else {
      return {
        data: { ...input.data, payment: responseStatusData },
        status: "error", // If the payment is not successful, return error status
      }
    }
  }

  cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    throw new Error("LiqPay does not support canceling payments directly.");
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const params = {
      ...paymentParams,
      action: "pay",
      description: "Оплата за товар Болагро",
      amount: input.amount,
      order_id: input.data?.order_id as string,
      currency: input.currency_code.toUpperCase() || "UAH", // Default to UAH if not provided
    }
    const data = this.liqPayClient.generateData(input.data?.liqPayPublicKey, params);
    const signature = this.liqPayClient.generateSignature(this.options.privateKey, data);

    return {
      id: params.order_id,
      data: { data, signature },
    }
  }

  deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    // no need to delete payment in LiqPay, just return the data
    return Promise.resolve({
      data: input.data
    })
  }

  getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    throw new Error("LiqPay does not support getting payment status directly.");
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const params = {
      ...paymentParams,
      action: "refund",
      amount: input?.data?.amount,
      public_key: input.data?.liqPayPublicKey,
      order_id: input.data?.order_id as string,
      currency: input?.data?.payment?.['currency'] ?? "UAH", // Default to UAH if not provided
    }
    const data = this.liqPayClient.generateData(input.data?.liqPayPublicKey, params);
    const signature = this.liqPayClient.generateSignature(this.options.privateKey, data);
    const refundStatusResponse = await fetch(this.liqPayClient.address, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ data, signature }).toString(),
    });
    const responseStatusData = await refundStatusResponse.json();
    return { data: responseStatusData }
  }

  retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    throw new Error("LiqPay does not support retrieving payments directly.");
  }

  updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    throw new Error("LiqPay does not support updating payments directly.");
  }

  getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    throw new Error("Method not implemented.")
  }

  static identifier = "liqpay"

  constructor(container, options: LiqPayOptions) {
    super(container, options)
    this.options = options;
  }
}

export default LiqPayPaymentProviderService
