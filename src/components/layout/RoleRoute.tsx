import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
    const { currentUser } = useAuth();

    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/lectures" replace />;
    }

    return <>{children}</>;
}
