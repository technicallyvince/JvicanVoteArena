export interface TransactPayOrderCustomer {
  firstname: string
  lastname: string
  mobile?: string
  country?: string
  email: string
}

export interface TransactPayOrderDetails {
  amount: number
  reference: string
  description: string
  currency: string
}

export interface TransactPayOrderPayment {
  RedirectUrl: string
}

export interface CreateOrderRequest {
  customer: TransactPayOrderCustomer
  order: TransactPayOrderDetails
  payment: TransactPayOrderPayment
}

export interface CreateOrderResponse {
  status: boolean
  message: string
  data?: {
    checkoutUrl?: string
    paymentUrl?: string
    redirect_url?: string
    reference: string
    orderId?: string
  }
}

export type TransactPayPaymentStatus = 'successful' | 'failed' | 'pending' | 'cancelled'

export interface VerifyTransactionResponse {
  status: boolean
  message: string
  data?: {
    reference: string
    gateway_reference?: string
    order_id?: string
    amount: number
    currency: string
    status: TransactPayPaymentStatus
    paid_at?: string
    customer_email?: string
    metadata?: Record<string, any>
  }
}

export interface TransactPayWebhookPayload {
  event?: string
  status?: string
  reference?: string
  orderId?: string
  order?: {
    reference?: string
    orderId?: string
    amount?: number
    currency?: string
    status?: string
  }
  data?: {
    reference?: string
    orderId?: string
    amount?: number
    currency?: string
    status?: string
    gateway_reference?: string
    paid_at?: string
    customer?: {
      email?: string
    }
  }
  id?: string
  gateway_reference?: string
  amount?: number
  currency?: string
  paid_at?: string
}

export interface TransactPayConfig {
  apiUrl: string
  publicKey: string
  secretKey: string
  webhookSecret?: string
  env: 'test' | 'live'
}
