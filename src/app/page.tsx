import { Suspense } from "react";
import { connection } from "next/server";
import AuthenticatedPage from "@/features/auth/presentation/components/authenticated-page";
import DashboardWorkspace from "@/components/dashboard/dashboard-workspace";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();

  return (
    <AuthenticatedPage>
      <DashboardWorkspace />
    </AuthenticatedPage>
  );
}
