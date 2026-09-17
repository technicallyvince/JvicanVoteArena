import { CreateOrderRequest, CreateOrderResponse, VerifyTransactionResponse } from './types'

const TRANSACTPAY_API_URL = process.env.TRANSACTPAY_API_URL || 'https://payment-api-service.transactpay.ai'
const TRANSACTPAY_PUBLIC_KEY = process.env.TRANSACTPAY_PUBLIC_KEY || ''
const TRANSACTPAY_SECRET_KEY = process.env.TRANSACTPAY_SECRET_KEY || ''

export class TransactPayClient {
  private apiUrl: string
  private publicKey: string
  private secretKey: string

  constructor() {
    this.apiUrl = TRANSACTPAY_API_URL
    this.publicKey = TRANSACTPAY_PUBLIC_KEY
    this.secretKey = TRANSACTPAY_SECRET_KEY
  }

  /**
   * Initializes standard checkout order on TransactPay
   */
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    // If real credentials are provided, call live endpoint
    if (this.publicKey && !this.publicKey.includes('mock') && !this.publicKey.includes('test_your')) {
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
          throw new Error(`TransactPay API error (${response.status}): ${errorText}`)
        }

        return await response.json()
      } catch (err: any) {
        console.error('TransactPay createOrder error:', err)
        throw err
      }
    }

    // In Sandbox/Dev simulation mode:
    // Generate a direct sandbox return URL that simulates TransactPay checkout flow
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const simulatedCheckoutUrl = `${baseUrl}/payment/simulate-checkout?ref=${encodeURIComponent(
      payload.order.reference
    )}&amount=${payload.order.amount}&email=${encodeURIComponent(
      payload.customer.email
    )}&redirectUrl=${encodeURIComponent(payload.payment.RedirectUrl)}`

    return {
      status: true,
      message: 'Order created successfully (Sandbox Simulation)',
      data: {
        checkoutUrl: simulatedCheckoutUrl,
        paymentUrl: simulatedCheckoutUrl,
        reference: payload.order.reference,
        orderId: `tp_ord_${Date.now()}`,
      },
    }
  }

  /**
   * Server-side transaction verification with Secret Key
   */
  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    if (this.secretKey && !this.secretKey.includes('mock') && !this.secretKey.includes('test_your')) {
      try {
        const response = await fetch(`${this.apiUrl}/payment/order/verify/${reference}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.secretKey,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`TransactPay verification failed (${response.status}): ${errorText}`)
        }

        return await response.json()
      } catch (err: any) {
        console.error('TransactPay verification error:', err)
        throw err
      }
    }

    // Simulated sandbox response
    return {
      status: true,
      message: 'Transaction verified (Sandbox Simulation)',
      data: {
        reference,
        gateway_reference: `TP-GW-${Date.now()}`,
        amount: 0, // Server will enforce DB amount
        currency: 'NGN',
        status: 'successful',
        paid_at: new Date().toISOString(),
      },
    }
  }
}

export const transactPay = new TransactPayClient()
