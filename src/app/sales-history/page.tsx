import SalesHistoryPage from "@/components/dashboard/sales-history-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function SalesHistory() {
    return (
        <ProtectedPage>
            <SalesHistoryPage />
        </ProtectedPage>
    );
}
