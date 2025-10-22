import BillingPage from "@/components/dashboard/billing-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Billing() {
    return (
        <ProtectedPage>
            <BillingPage />
        </ProtectedPage>
    );
}
