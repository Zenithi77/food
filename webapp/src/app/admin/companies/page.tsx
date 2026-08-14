import { listCompanies } from "@/lib/db";
import { CompaniesManager } from "@/components/admin/CompaniesManager";

export default async function AdminCompaniesPage() {
  const companies = await listCompanies();
  return <CompaniesManager companies={companies} />;
}
