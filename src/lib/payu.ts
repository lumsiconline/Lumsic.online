/**
 * PayU Hosted Checkout Client Integration
 * Handles PayU Hosted Checkout redirection, transaction initialization, and wallet verification.
 * 
 * Note: Merchant Salt is NEVER exposed on client-side code.
 * The SHA-512 payment hash is generated securely on the server.
 */

export interface PayUInitiateResult {
  success: boolean;
  actionUrl: string;
  txnid: string;
  mode: 'test' | 'production';
  params: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    surl: string;
    furl: string;
    hash: string;
    service_provider?: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  };
  error?: string;
}

export interface PayUVerifyResult {
  success: boolean;
  orderId: string;
  txnid?: string;
  payuPaymentId?: string;
  status: string;
  creditedAmount?: number;
  bonusAmount?: number;
  totalBalance?: number;
  message?: string;
  error?: string;
}

/**
 * Initiates a PayU Hosted Checkout transaction via the backend server.
 * The server generates the unique txnid, sets return URLs, and computes the SHA-512 hash.
 */
export async function initiatePayUPayment(params: {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  currency: string;
  isFirstRecharge?: boolean;
}): Promise<PayUInitiateResult> {
  const res = await fetch('/api/payu/initiate-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-customer-id': params.customerId
    },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to initialize PayU payment session.');
  }

  return data;
}

/**
 * Redirects the user's browser to the PayU Hosted Checkout page.
 * Creates an automated hidden HTML POST form with all server-signed parameters.
 */
export function redirectToPayUHostedCheckout(
  actionUrl: string, 
  formParams: Record<string, string>
): void {
  // If running in an iframe with frame-ancestors restrictions, or if testing in developer sandbox:
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;
  form.style.display = 'none';

  Object.entries(formParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}

/**
 * Verifies PayU payment status and confirmation with server.
 */
export async function verifyPayUPayment(params: {
  txnid: string;
  customerId: string;
}): Promise<PayUVerifyResult> {
  const res = await fetch('/api/payu/verify-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-customer-id': params.customerId
    },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Payment verification failed with PayU.');
  }

  return data;
}

/**
 * Developer Interactive Test Dialog for PayU Test Sandbox
 * Used when testing inside iframe environments where external redirects to test.payu.in may be blocked by browser sandbox.
 */
export function openPayUTestModal(options: {
  actionUrl: string;
  params: Record<string, string>;
  currencySymbol: string;
  onSuccess: (txnid: string) => void;
  onCancel: () => void;
}): void {
  const existing = document.getElementById('payu-test-modal-container');
  if (existing) existing.remove();

  const amt = Number(options.params.amount || 0);
  const symbol = options.currencySymbol || '£';
  const txnid = options.params.txnid;

  const modalContainer = document.createElement('div');
  modalContainer.id = 'payu-test-modal-container';
  modalContainer.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);padding:16px;';

  modalContainer.innerHTML = `
    <div style="background:#FFFFFF;border-radius:24px;width:100%;max-width:440px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);font-family:system-ui,-apple-system,sans-serif;color:#1E293B;">
      <!-- PayU Header -->
      <div style="background:linear-gradient(135deg,#002B49 0%,#001C30 100%);padding:20px;color:white;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #A4C639;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="background:#A4C639;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#002B49;font-size:18px;">
            P
          </div>
          <div>
            <div style="font-weight:800;font-size:16px;letter-spacing:0.5px;">PayU Hosted Checkout</div>
            <div style="font-size:11px;color:#94A3B8;">Test Sandbox Mode</div>
          </div>
        </div>
        <span style="font-size:10px;font-weight:800;text-transform:uppercase;padding:4px 8px;border-radius:9999px;background:#A4C639;color:#002B49;">
          Test Mode
        </span>
      </div>

      <!-- Content -->
      <div style="padding:24px;">
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:16px;margin-bottom:16px;">
          <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;margin-bottom:4px;">Transaction ID</div>
          <div style="font-family:monospace;font-size:12px;font-weight:700;color:#0F172A;word-break:break-all;">${txnid}</div>
          <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:baseline;">
            <span style="font-size:12px;color:#64748B;">Recharge Amount:</span>
            <span style="font-size:22px;font-weight:900;color:#002B49;">${symbol}${amt.toFixed(2)}</span>
          </div>
        </div>

        <div style="font-size:12px;color:#475569;line-height:1.5;margin-bottom:20px;">
          <span style="font-weight:700;color:#002B49;">PayU Hosted Gateway Simulation:</span><br/>
          Click <strong>Proceed to PayU Gateway</strong> to submit to PayU's hosted checkout (<code>test.payu.in</code>), or click <strong>Simulate Test Approval</strong> to verify instant server hash verification and wallet crediting.
        </div>

        <!-- Buttons -->
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button id="payu-btn-hosted-redirect" style="width:100%;padding:12px;border-radius:12px;background:#002B49;color:#FFFFFF;border:none;font-weight:700;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span>Submit to PayU Hosted Checkout</span>
            <span style="font-size:16px;">➔</span>
          </button>
          <button id="payu-btn-simulate-success" style="width:100%;padding:12px;border-radius:12px;background:#A4C639;color:#002B49;border:none;font-weight:800;font-size:14px;cursor:pointer;">
            Simulate Test Approval &amp; Verify Hash
          </button>
          <button id="payu-btn-cancel" style="width:100%;padding:10px;border-radius:12px;background:transparent;color:#64748B;border:1px solid #CBD5E1;font-weight:600;font-size:13px;cursor:pointer;">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // Event handlers
  const btnRedirect = document.getElementById('payu-btn-hosted-redirect');
  const btnSimulate = document.getElementById('payu-btn-simulate-success');
  const btnCancel = document.getElementById('payu-btn-cancel');

  btnRedirect?.addEventListener('click', () => {
    modalContainer.remove();
    redirectToPayUHostedCheckout(options.actionUrl, options.params);
  });

  btnSimulate?.addEventListener('click', async () => {
    try {
      if (btnSimulate) btnSimulate.innerText = 'Verifying Hash on Server...';
      const simRes = await fetch('/api/payu/simulate-test-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnid })
      });
      const simData = await simRes.json();
      modalContainer.remove();
      if (simData.success) {
        options.onSuccess(txnid);
      } else {
        console.warn('PayU test verification notice:', simData.error || 'Test verification failed');
        options.onCancel();
      }
    } catch {
      modalContainer.remove();
      options.onCancel();
    }
  });

  btnCancel?.addEventListener('click', () => {
    modalContainer.remove();
    options.onCancel();
  });
}
