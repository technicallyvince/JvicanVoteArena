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
   * Initializes standard hosted checkout order on TransactPay
   * Official Endpoint: POST /payment/order/create
   */
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    if (this.isConfigured()) {
      try {
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
          console.error(`TransactPay createOrder HTTP ${response.status}:`, errorText)
          throw new Error(`TransactPay API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        
        // Normalize response field names (support checkoutUrl, paymentUrl, redirect_url)
        const redirectUrl =
          data.data?.checkoutUrl ||
          data.data?.paymentUrl ||
          data.data?.redirect_url ||
          data.checkoutUrl ||
          data.paymentUrl ||
          data.redirect_url

        return {
          status: data.status ?? true,
          message: data.message || 'Order created successfully',
          data: {
            checkoutUrl: redirectUrl,
            paymentUrl: redirectUrl,
            redirect_url: redirectUrl,
            reference: payload.order.reference,
            orderId: data.data?.orderId || data.orderId || `tp_ord_${Date.now()}`,
          },
        }
      } catch (err: any) {
        console.error('TransactPay createOrder exception:', err)
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
          console.error(`TransactPay verifyTransaction HTTP ${response.status}:`, errorText)
          throw new Error(`TransactPay verification failed (${response.status}): ${errorText}`)
        }

        const resData = await response.json()
        return resData
      } catch (err: any) {
        console.error('TransactPay verifyTransaction exception:', err)
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
