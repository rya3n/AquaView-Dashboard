import SalesPage from "@/components/dashboard/sales-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Sales() {
    return (
        <ProtectedPage>
            <SalesPage />
        </ProtectedPage>
    );
}
