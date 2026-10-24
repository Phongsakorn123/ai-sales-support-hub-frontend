import AuthenticatedPage from "@/features/auth/presentation/components/authenticated-page";
import DashboardWorkspace from "@/components/dashboard/dashboard-workspace";

export default function Home() {
  return (
    <AuthenticatedPage>
      <DashboardWorkspace />
    </AuthenticatedPage>
  );
}
