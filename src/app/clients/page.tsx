import ClientsPage from "@/components/dashboard/clients-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Clients() {
    return (
        <ProtectedPage>
            <ClientsPage />
        </ProtectedPage>
    );
}
