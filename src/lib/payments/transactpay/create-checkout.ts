import { transactPay } from './client'

export interface CreateCheckoutSessionParams {
  reference: string
  amount: number
  currency: string
  voterEmail: string
  nomineeName: string
  eventName: string
  voteQuantity: number
}

export interface CreateCheckoutSessionResult {
  success: boolean
  redirectUrl?: string
  orderId?: string
  error?: string
}

/**
 * Creates a hosted checkout session on TransactPay for standard redirect payment
 */
export async function createTransactPayCheckout(
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResult> {
  const {
    reference,
    amount,
    currency,
    voterEmail,
    nomineeName,
    eventName,
    voteQuantity,
  } = params

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUrl = `${baseUrl}/payment/callback?ref=${encodeURIComponent(reference)}`

  try {
    const orderResponse = await transactPay.createOrder({
      customer: {
        firstname: 'Voter',
        lastname: nomineeName.split(' ')[0] || 'Supporter',
        email: voterEmail,
        country: 'NG',
      },
      order: {
        amount,
        currency,
        reference,
        description: `${voteQuantity} Vote(s) for ${nomineeName} - ${eventName}`,
      },
      payment: {
        RedirectUrl: redirectUrl,
      },
    })

    if (!orderResponse.status || !orderResponse.data) {
      return {
        success: false,
        error: orderResponse.message || 'Payment initialization failed with TransactPay.',
      }
    }

    const checkoutUrl =
      orderResponse.data.checkoutUrl ||
      orderResponse.data.paymentUrl ||
      orderResponse.data.redirect_url

    if (!checkoutUrl) {
      return {
        success: false,
        error: 'No redirect checkout URL received from TransactPay gateway.',
      }
    }

    return {
      success: true,
      redirectUrl: checkoutUrl,
      orderId: orderResponse.data.orderId,
    }
  } catch (err: any) {
    console.error('createTransactPayCheckout error:', err)
    return {
      success: false,
      error: err.message || 'Payment service error',
    }
  }
}
