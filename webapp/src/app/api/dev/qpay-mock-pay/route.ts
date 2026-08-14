import { NextRequest, NextResponse } from "next/server";
import { getPaymentByOrderId } from "@/lib/db";
import { QPAY_MOCK_MODE, mockMarkInvoicePaid } from "@/lib/qpay";
import { z } from "zod";

const BodySchema = z.object({ orderId: z.string().trim().min(1) });

// Зөвхөн QPay credentials ирээгүй (mock горим) үед идэвхтэй — sandbox тестлэхэд QPay-ийн
// webhook ирсэн мэт төлбөрийг гараар "төлөгдсөн" болгоно. Бодит credentials орж ирмэгц
// QPAY_MOCK_MODE false болж, энэ route бүрэн идэвхгүй болно.
export async function POST(request: NextRequest) {
  if (!QPAY_MOCK_MODE) {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу мэдээлэл." }, { status: 400 });
  }

  const payment = await getPaymentByOrderId(parsed.data.orderId);
  if (!payment || !payment.qpayInvoiceId) {
    return NextResponse.json({ error: "Захиалга/нэхэмжлэх олдсонгүй." }, { status: 404 });
  }

  mockMarkInvoicePaid(payment.qpayInvoiceId);
  return NextResponse.json({ ok: true });
}
