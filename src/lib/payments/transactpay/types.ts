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
    reference: string
    orderId?: string
  }
}

export interface VerifyTransactionResponse {
  status: boolean
  message: string
  data?: {
    reference: string
    gateway_reference?: string
    amount: number
    currency: string
    status: 'successful' | 'failed' | 'pending' | 'cancelled'
    paid_at?: string
    customer_email?: string
  }
}
