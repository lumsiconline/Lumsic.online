/**
 * Razorpay Standard Web Checkout Integration Helper
 * Reference: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
 */

export interface RazorpayOrderResponse {
  order_id: string;
  id?: string;
  amount: number; // In smallest currency unit (paise/cents)
  currency: string;
  receipt?: string;
  key_id?: string;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerificationResult {
  success: boolean;
  message?: string;
  payment_id?: string;
  order_id?: string;
  error?: string;
  wallet?: any;
  creditedAmount?: number;
}

export interface InitiateCheckoutOptions {
  amount: number; // in paise / cents (e.g. 500 for $5.00 or ₹500 for INR)
  currency?: string; // 'INR', 'USD', 'GBP', 'EUR'
  receipt?: string;
  name?: string;
  description?: string;
  customerId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  isPaise?: boolean;
  onSuccess?: (result: RazorpayVerificationResult) => void;
  onError?: (error: Error | string) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Ensures Razorpay Checkout script is loaded in the DOM
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Creates an order via backend endpoint POST /api/create-order
 */
export async function createRazorpayOrder(params: {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create Razorpay order');
  }

  return data;
}

/**
 * Verifies the payment signature via backend endpoint POST /api/verify-payment
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  customerId?: string;
  amount?: number;
  currency?: string;
  isPaise?: boolean;
}): Promise<RazorpayVerificationResult> {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed');
  }

  return data;
}

/**
 * Full Razorpay Standard Checkout Flow:
 * 1. Loads script
 * 2. Calls POST /api/create-order
 * 3. Opens Razorpay modal
 * 4. On success: calls POST /api/verify-payment
 * 5. Handles cancel & error events
 */
export async function initiateRazorpayCheckout(options: InitiateCheckoutOptions): Promise<void> {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    // 1. Create order on backend
    const order = await createRazorpayOrder({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes
    });

    const keyId = order.key_id || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TtnEYNftIawfUS';

    // 2. Configure Razorpay modal options
    const rzpOptions = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: options.name || 'LUMSIC Spiritual Guidance',
      description: options.description || 'Consultation Balance Recharge',
      order_id: order.order_id || order.id,
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || ''
      },
      theme: {
        color: '#581C87' // Purple branding matching LUMSIC
      },
      // Payment Success Handler
      handler: async function (response: RazorpayPaymentSuccessResponse) {
        try {
          // 3. Send payment credentials to backend signature verification
          const verificationResult = await verifyRazorpayPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            customerId: options.customerId,
            amount: options.amount,
            currency: options.currency || order.currency,
            isPaise: options.isPaise ?? true
          });

          if (options.onSuccess) {
            options.onSuccess(verificationResult);
          }
        } catch (verifyErr: any) {
          console.error('Razorpay verification error:', verifyErr);
          if (options.onError) {
            options.onError(verifyErr.message || 'Payment signature verification failed.');
          }
        }
      },
      // Modal dismissed by user (cancel)
      modal: {
        ondismiss: function () {
          console.log('Razorpay modal dismissed by user');
          if (options.onCancel) {
            options.onCancel();
          }
        }
      }
    };

    const rzpInstance = new window.Razorpay(rzpOptions);

    // Handle payment.failed event
    rzpInstance.on('payment.failed', function (response: any) {
      console.error('Razorpay payment.failed:', response.error);
      const errMsg = response?.error?.description || response?.error?.reason || 'Payment failed with Razorpay.';
      if (options.onError) {
        options.onError(new Error(errMsg));
      }
    });

    rzpInstance.open();
  } catch (err: any) {
    console.error('Razorpay checkout initialization error:', err);
    if (options.onError) {
      options.onError(err.message || 'Failed to initialize Razorpay checkout');
    }
  }
}
