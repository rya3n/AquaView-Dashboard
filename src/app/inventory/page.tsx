import InventoryPage from "@/components/dashboard/inventory-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Inventory() {
    return (
        <ProtectedPage>
            <InventoryPage />
        </ProtectedPage>
    );
}
