import { ReactNode } from "react";
import { useAuth } from "../../_hooks/auth";
import { useLocation, Navigate } from "react-router-dom";

interface AdminGuardProps {
    children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const { authData, loading } = useAuth(); // zakładam, że masz 'loading' w swoim hooku!
    const location = useLocation();

    const isOnlyAdministrator = () =>
        authData?.roles?.length === 1 &&
        authData?.roles?.includes("ROLE_ADMINISTRATOR");

    // Poczekaj, aż hook się załaduje
    if (loading) return <div>Ładowanie...</div>;

    if (isOnlyAdministrator() && location.pathname !== "/pages/addUser") {
        return <Navigate to="/pages/addUser" replace />;
    }

    return <>{children}</>;
};
