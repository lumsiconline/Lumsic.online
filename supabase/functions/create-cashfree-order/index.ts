import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Cashfree PG Configuration from Supabase Environment Secrets
const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID') || '';
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY') || '';
const CASHFREE_MODE = (
  CASHFREE_SECRET_KEY.includes('_prod_') 
    ? 'production' 
    : (Deno.env.get('CASHFREE_MODE') || 'sandbox')
).toLowerCase();
const CASHFREE_API_VERSION = Deno.env.get('CASHFREE_API_VERSION') || '2023-08-01';
const LUMSIC_PUBLIC_URL = Deno.env.get('LUMSIC_PUBLIC_URL') || 'https://lumsic.in';

const CASHFREE_BASE_URL = CASHFREE_MODE === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      customerId, 
      customerName, 
      customerEmail, 
      customerPhone, 
      amount, 
      currency = 'INR' 
    } = body;

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return new Response(JSON.stringify({ error: 'Valid recharge amount is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean order ID: Cashfree requires alphanumeric, underscores, hyphens (max 45 chars)
    const cleanCustId = String(customerId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 15);
    const orderId = `LUM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Prepare customer details
    const cleanPhone = String(customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10) || '9999999999';
    const cleanEmail = customerEmail && customerEmail.includes('@') ? customerEmail : `user_${cleanCustId}@lumsic.in`;
    const cleanName = customerName || 'LUMSIC Valued Seeker';

    const orderCurrency = currency === 'INR' ? 'INR' : currency;

    // Prepare order request payload for Cashfree Orders API
    const orderPayload = {
      order_id: orderId,
      order_amount: numAmount,
      order_currency: orderCurrency,
      customer_details: {
        customer_id: cleanCustId || 'lumsic_user',
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone
      },
      order_meta: {
        return_url: `${LUMSIC_PUBLIC_URL}/?cf_order_id={order_id}`,
        notify_url: `${LUMSIC_PUBLIC_URL}/api/cashfree/webhook`
      },
      order_note: `LUMSIC Astrology Wallet Recharge (${orderCurrency} ${numAmount.toFixed(2)})`
    };

    // If Cashfree keys are configured, call Cashfree PG Sandbox / Production API
    if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
      const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': CASHFREE_API_VERSION
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Cashfree Order creation failed.');
      }

      return new Response(JSON.stringify({
        success: true,
        orderId: data.order_id || orderId,
        paymentSessionId: data.payment_session_id,
        orderAmount: data.order_amount || numAmount,
        orderCurrency: data.order_currency || orderCurrency,
        cfOrderId: data.cf_order_id,
        mode: CASHFREE_MODE,
        environment: CASHFREE_MODE
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sandbox Simulation Mode when keys are being provisioned
    const mockPaymentSessionId = `session_sb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return new Response(JSON.stringify({
      success: true,
      orderId,
      paymentSessionId: mockPaymentSessionId,
      orderAmount: numAmount,
      orderCurrency,
      cfOrderId: `CF_${orderId}`,
      mode: 'sandbox',
      environment: 'sandbox',
      isSandboxSimulation: true,
      notice: 'Cashfree Sandbox Mode active. Configure CASHFREE_APP_ID and CASHFREE_SECRET_KEY for live sandbox gateway.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({
      error: err.message || 'Internal server error while initializing Cashfree order.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
