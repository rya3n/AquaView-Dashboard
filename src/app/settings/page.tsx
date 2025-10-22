import SettingsPage from "@/components/dashboard/settings-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Settings() {
    return (
        <ProtectedPage>
            <SettingsPage />
        </ProtectedPage>
    );
}
