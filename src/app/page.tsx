import { connection } from "next/server";
import AuthenticatedPage from "@/features/auth/presentation/components/authenticated-page";
import DashboardWorkspace from "@/components/dashboard/dashboard-workspace";

export default async function Home() {
  await connection();

  return (
    <AuthenticatedPage>
      <DashboardWorkspace />
    </AuthenticatedPage>
  );
}
