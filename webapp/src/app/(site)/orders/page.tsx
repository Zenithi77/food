import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listOrders } from "@/lib/db";
import { formatMNT, formatDateMN } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Хүлээгдэж буй",
  SHIPPED: "Хүргэлтэнд гарсан",
  DELIVERED: "Хүргэгдсэн",
  CANCELLED: "Цуцлагдсан",
};

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-primary-container text-on-primary-container",
  SHIPPED: "bg-secondary-container text-secondary",
  PENDING: "bg-error-container text-on-error-container",
  CANCELLED: "bg-surface-container-high text-secondary",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { success } = await searchParams;

  const orders = await listOrders({ userId: session.userId });

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-u-xl w-full">
      <h1 className="font-display-lg text-display-lg text-primary mb-u-lg">Миний захиалгууд</h1>

      {success === "1" && (
        <div className="mb-u-lg p-u-md rounded-lg bg-primary-container text-on-primary-container flex items-center gap-2">
          Таны захиалга амжилттай бүртгэгдлээ! Бид тун удахгүй холбогдох болно.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-u-xl">
          <p className="text-secondary mb-u-lg">Та одоогоор захиалга хийгээгүй байна.</p>
          <Link
            href="/"
            className="inline-block bg-primary text-on-primary py-3 px-8 rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity"
          >
            ДЭЛГҮҮР ХЭСЭХ
          </Link>
        </div>
      ) : (
        <div className="space-y-u-md">
          {orders.map((order) => (
            <div key={order.id} className="item-card-shadow bg-surface-container-lowest rounded-lg p-u-md">
              <div className="flex flex-wrap justify-between items-start gap-u-sm mb-u-sm">
                <div>
                  <p className="font-label-md text-label-md text-primary">Захиалга #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-label-sm text-secondary">{formatDateMN(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-label-sm ${STATUS_STYLES[order.status]}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <div className="divide-y divide-outline-variant border-t border-b border-outline-variant mb-u-sm">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-u-sm py-u-sm">
                    <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 relative bg-surface-container-low">
                      <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-label-md text-label-md">{item.name}</p>
                      <p className="text-label-sm text-secondary">
                        {item.quantity} x {formatMNT(item.price)}
                      </p>
                    </div>
                    <p className="font-label-md text-label-md">{formatMNT(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-label-sm text-secondary">{order.address}</p>
                <p className="font-headline-md text-headline-md text-primary">{formatMNT(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
