import DashboardPage from "@/components/dashboard/dashboard-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Home() {
  return (
    <ProtectedPage>
      <DashboardPage />
    </ProtectedPage>
  );
}
