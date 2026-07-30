import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { z } from "zod";

const StatusSchema = z.object({
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу төлөв." }, { status: 400 });
  }

  await updateOrderStatus(id, parsed.data.status);
  return NextResponse.json({ ok: true });
}
