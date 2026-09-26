import {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyTransactionResponse,
  TransactPayConfig,
} from './types'

export class TransactPayClient {
  private apiUrl: string
  private publicKey: string
  private secretKey: string
  private webhookSecret: string
  private env: 'test' | 'live'

  constructor() {
    this.apiUrl =
      process.env.TRANSACTPAY_API_URL || 'https://payment-api-service.transactpay.ai'
    this.publicKey = process.env.TRANSACTPAY_PUBLIC_KEY || ''
    this.secretKey = process.env.TRANSACTPAY_SECRET_KEY || ''
    this.webhookSecret = process.env.TRANSACTPAY_WEBHOOK_SECRET || ''
    this.env = (process.env.TRANSACTPAY_ENV as 'test' | 'live') || 'test'
  }

  /**
   * Check whether live or test API keys are actively configured
   */
  public isConfigured(): boolean {
    return (
      Boolean(this.publicKey) &&
      !this.publicKey.includes('your_public_key') &&
      !this.publicKey.includes('mock')
    )
  }

  public getEnvironment(): 'test' | 'live' {
    return this.env
  }

  /**
   * Creates a hosted checkout order on TransactPay.
   *
   * Per the official TransactPay "Getting Started" docs, the Standard Checkout
   * order creation endpoint accepts PLAIN JSON with the api-key header set to
   * the Public Key. Encryption is ONLY required for direct card payment flows
   * (where raw card data is submitted via the REST Card Payments API).
   *
   * Official endpoint: POST /payment/order/create
   * Header: api-key: PUBLIC_KEY
   * Body: { customer, order, payment } (plain JSON — NOT encrypted)
   *
   * Reference: https://transactpay.readme.io/docs/api-keys (Step 3)
   */
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    if (this.isConfigured()) {
      try {
        console.log('[TransactPay] Creating order with plain JSON payload (Standard Checkout flow)')
        console.log('[TransactPay] Endpoint:', `${this.apiUrl}/payment/order/create`)
        console.log('[TransactPay] API Key prefix:', this.publicKey.substring(0, 20) + '...')

        const response = await fetch(`${this.apiUrl}/payment/order/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.publicKey,
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[TransactPay] createOrder HTTP ${response.status}:`, errorText)
          throw new Error(`TransactPay API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        console.log('[TransactPay] createOrder response status:', data.status, data.statusCode)

        // The official response shape from TransactPay docs:
        // {
        //   data: { order: { reference, ... }, subsidiary: {...}, customer: {...}, payment: {...}, ... },
        //   status: "success",
        //   statusCode: "01",
        //   message: "Created order successfully"
        // }

        // Build the checkout URL — TransactPay Standard Kit uses a web SDK checkout page
        // The checkout URL is constructed from the order reference
        const orderRef =
          data.data?.order?.reference ||
          data.data?.order?.processorReference ||
          payload.order.reference

        // TransactPay hosted checkout URL format
        const checkoutBaseUrl = 'https://payment-web-sdk.transactpay.ai/v1/checkout'
        const hostedCheckoutUrl = `${checkoutBaseUrl}?reference=${encodeURIComponent(orderRef)}`

        // Also check if the API directly returned a redirect/checkout URL
        const directUrl =
          data.data?.checkoutUrl ||
          data.data?.paymentUrl ||
          data.data?.redirect_url ||
          data.checkoutUrl ||
          data.paymentUrl ||
          data.redirect_url

        const redirectUrl = directUrl || hostedCheckoutUrl

        return {
          status: data.status === 'success' || data.status === true,
          message: data.message || 'Order created successfully',
          data: {
            checkoutUrl: redirectUrl,
            paymentUrl: redirectUrl,
            redirect_url: redirectUrl,
            reference: orderRef,
            orderId:
              data.data?.order?.processorReference ||
              data.data?.orderId ||
              data.orderId ||
              `tp_ord_${Date.now()}`,
          },
        }
      } catch (err: any) {
        console.error('[TransactPay] createOrder exception:', err)
        throw err
      }
    }

    // Fallback sandbox simulation when keys are not yet added
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const simulatedCheckoutUrl = `${baseUrl}/payment/simulate-checkout?ref=${encodeURIComponent(
      payload.order.reference
    )}&amount=${payload.order.amount}&email=${encodeURIComponent(
      payload.customer.email
    )}&redirectUrl=${encodeURIComponent(payload.payment.RedirectUrl)}`

    return {
      status: true,
      message: 'Order created successfully (Sandbox Simulation Mode)',
      data: {
        checkoutUrl: simulatedCheckoutUrl,
        paymentUrl: simulatedCheckoutUrl,
        redirect_url: simulatedCheckoutUrl,
        reference: payload.order.reference,
        orderId: `tp_sim_${Date.now()}`,
      },
    }
  }

  /**
   * Server-side transaction verification with Secret Key
   * Verifies authoritative payment status against TransactPay gateway
   * Official Endpoint: POST /payment/order/verify
   * Request Payload: { "reference": "order_reference" }
   * Header: api-key: {{secret_key}}
   */
  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    if (
      this.secretKey &&
      !this.secretKey.includes('your_secret_key') &&
      !this.secretKey.includes('mock')
    ) {
      try {
        // TransactPay official docs specify POST /payment/order/verify with { reference }
        const response = await fetch(`${this.apiUrl}/payment/order/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.secretKey,
          },
          body: JSON.stringify({ reference }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[TransactPay] verifyTransaction HTTP ${response.status}:`, errorText)
          throw new Error(`TransactPay verification failed (${response.status}): ${errorText}`)
        }

        const resData = await response.json()
        return resData
      } catch (err: any) {
        console.error('[TransactPay] verifyTransaction exception:', err)
        throw err
      }
    }

    // Fallback sandbox simulation verification
    return {
      status: true,
      message: 'Transaction verified (Sandbox Simulation Mode)',
      data: {
        reference,
        gateway_reference: `TP-GW-SIM-${Date.now()}`,
        amount: 0,
        currency: 'NGN',
        status: 'successful',
        paid_at: new Date().toISOString(),
      },
    }
  }
}

export const transactPay = new TransactPayClient()
