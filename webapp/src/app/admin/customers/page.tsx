import { listCustomers } from "@/lib/db";
import { formatDateMN } from "@/lib/format";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary mb-u-lg">Хэрэглэгчид</h1>
      <div className="item-card-shadow bg-surface-container-lowest rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Нэр</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Имэйл</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Утас</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Захиалга</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-right">Бүртгүүлсэн</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-u-md py-6 text-center text-secondary">
                  Хэрэглэгч алга.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-t border-outline-variant">
                  <td className="px-u-md py-3 font-label-md">{customer.name}</td>
                  <td className="px-u-md py-3">{customer.email}</td>
                  <td className="px-u-md py-3">{customer.phone || "—"}</td>
                  <td className="px-u-md py-3">{customer.orderCount}</td>
                  <td className="px-u-md py-3 text-right">{formatDateMN(customer.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
