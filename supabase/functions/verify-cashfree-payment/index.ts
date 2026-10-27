import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID') || '';
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY') || '';
const CASHFREE_MODE = (
  CASHFREE_SECRET_KEY.includes('_prod_') 
    ? 'production' 
    : (Deno.env.get('CASHFREE_MODE') || 'sandbox')
).toLowerCase();
const CASHFREE_API_VERSION = Deno.env.get('CASHFREE_API_VERSION') || '2023-08-01';

const CASHFREE_BASE_URL = CASHFREE_MODE === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderId, customerId } = body;

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call Cashfree Order status API if keys present
    if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
      const orderRes = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': CASHFREE_API_VERSION
        }
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to fetch Cashfree order status.');
      }

      const isPaid = orderData.order_status === 'PAID';

      // Optionally fetch transaction payment details
      let paymentTxnId = orderData.cf_order_id;
      try {
        const paymentsRes = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}/payments`, {
          headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': CASHFREE_API_VERSION
          }
        });
        if (paymentsRes.ok) {
          const paymentsList = await paymentsRes.json();
          if (Array.isArray(paymentsList) && paymentsList.length > 0) {
            const successfulPayment = paymentsList.find((p: any) => p.payment_status === 'SUCCESS') || paymentsList[0];
            paymentTxnId = successfulPayment.cf_payment_id || successfulPayment.payment_id || paymentTxnId;
          }
        }
      } catch {}

      return new Response(JSON.stringify({
        success: isPaid,
        orderId: orderData.order_id,
        orderStatus: orderData.order_status,
        orderAmount: orderData.order_amount,
        orderCurrency: orderData.order_currency,
        cfOrderId: orderData.cf_order_id,
        paymentTxnId,
        paymentSessionId: orderData.payment_session_id,
        isVerified: isPaid,
        mode: CASHFREE_MODE
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sandbox simulated verification for testing
    return new Response(JSON.stringify({
      success: true,
      orderId,
      orderStatus: 'PAID',
      orderAmount: body.amount || 10,
      orderCurrency: body.currency || 'INR',
      paymentTxnId: `cf_pay_${Date.now()}`,
      isVerified: true,
      mode: 'sandbox',
      notice: 'Verified via Cashfree Sandbox simulation.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({
      error: err.message || 'Error verifying Cashfree payment.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
