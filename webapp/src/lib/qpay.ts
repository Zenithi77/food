const QPAY_BASE_URL = process.env.QPAY_BASE_URL || "https://merchant.qpay.mn";
const QPAY_CLIENT_ID = process.env.QPAY_CLIENT_ID;
const QPAY_CLIENT_SECRET = process.env.QPAY_CLIENT_SECRET;
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE;

// Хэрэв QPay-ийн credentials ирээгүй бол mock горимд автоматаар шилжинэ —
// credentials .env-д орж ирмэгц кодыг өөрчлөлгүйгээр бодит QPay API руу шилжинэ.
export const QPAY_MOCK_MODE = !QPAY_CLIENT_ID || !QPAY_CLIENT_SECRET;

// 1x1 тунгалаг PNG — зөвхөн mock горимд харагдах түр орлуулагч QR зураг.
const MOCK_QR_IMAGE =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export class QPayHttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface QPayInvoiceResult {
  invoiceId: string;
  qrImage: string;
  qrText: string;
  deeplinks: { name: string; link: string }[];
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retryable = err instanceof QPayHttpError ? err.status >= 500 : true;
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** i));
    }
  }
  throw lastErr;
}

async function qpayFetch(path: string, init: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${QPAY_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new QPayHttpError(`QPay ${path} failed: ${res.status} ${text}`, res.status);
  }
  return res.json();
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

const globalForQpay = globalThis as unknown as { qpayToken?: TokenCache; qpayMockPaid?: Set<string> };

function mockPaidSet(): Set<string> {
  if (!globalForQpay.qpayMockPaid) globalForQpay.qpayMockPaid = new Set();
  return globalForQpay.qpayMockPaid;
}

// Тест/sandbox горимд ашиглагдана — QPay-аас webhook ирсэн мэт төлбөрийг "төлөгдсөн" болгоно.
export function mockMarkInvoicePaid(invoiceId: string) {
  mockPaidSet().add(invoiceId);
}

async function getAccessToken(): Promise<string> {
  const cached = globalForQpay.qpayToken;
  if (cached && cached.expiresAt > Date.now() + 5000) {
    return cached.token;
  }

  return withRetry(async () => {
    const basic = Buffer.from(`${QPAY_CLIENT_ID}:${QPAY_CLIENT_SECRET}`).toString("base64");
    const data = await qpayFetch("/v2/auth/token", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}` },
    });
    globalForQpay.qpayToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return data.access_token as string;
  });
}

export async function createInvoice(input: {
  orderId: string;
  amount: number;
  description: string;
}): Promise<QPayInvoiceResult> {
  if (QPAY_MOCK_MODE) {
    return {
      invoiceId: `mock-${input.orderId}`,
      qrImage: MOCK_QR_IMAGE,
      qrText: `mock-qr-${input.orderId}`,
      deeplinks: [{ name: "Mock Bank (dev)", link: "https://example.com/mock-pay" }],
    };
  }

  const webhookSecret = process.env.QPAY_WEBHOOK_SECRET ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return withRetry(async () => {
    const token = await getAccessToken();
    const data = await qpayFetch("/v2/invoice", {
      method: "POST",
      token,
      body: JSON.stringify({
        invoice_code: QPAY_INVOICE_CODE,
        sender_invoice_no: input.orderId,
        invoice_receiver_code: "terminal",
        invoice_description: input.description,
        amount: input.amount,
        callback_url: `${appUrl}/api/payments/qpay/webhook?token=${webhookSecret}&orderId=${input.orderId}`,
      }),
    });
    return {
      invoiceId: data.invoice_id,
      qrImage: data.qr_image,
      qrText: data.qr_text,
      deeplinks: ((data.urls ?? []) as { name?: string; description?: string; link: string }[]).map((u) => ({
        name: u.name ?? u.description ?? "",
        link: u.link,
      })),
    };
  });
}

export interface QPayVerifyResult {
  paid: boolean;
  transactionId: string | null;
}

// Webhook болон polling хоёулаа энэ функцийг дуудаж QPay-аас статусыг ДАХИН шалгана —
// webhook/redirect-ийн payload-д итгэлгүй, эх сурвалжаас нь баталгаажуулна.
export async function verifyInvoicePayment(invoiceId: string): Promise<QPayVerifyResult> {
  if (QPAY_MOCK_MODE) {
    const paid = mockPaidSet().has(invoiceId);
    return { paid, transactionId: paid ? `mock-txn-${invoiceId}` : null };
  }

  return withRetry(async () => {
    const token = await getAccessToken();
    const data = await qpayFetch("/v2/payment/check", {
      method: "POST",
      token,
      body: JSON.stringify({ object_type: "INVOICE", object_id: invoiceId }),
    });
    const rows = (data.rows ?? []) as { payment_status?: string; payment_id?: string }[];
    const paidRow = rows.find((r) => r.payment_status === "PAID");
    return { paid: !!paidRow, transactionId: paidRow?.payment_id ?? null };
  });
}
