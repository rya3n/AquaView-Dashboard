import ProfilePage from "@/components/dashboard/profile-page";
import ProtectedPage from "@/components/dashboard/protected-page";

export default function Profile() {
    return (
        <ProtectedPage>
            <ProfilePage />
        </ProtectedPage>
    );
}
