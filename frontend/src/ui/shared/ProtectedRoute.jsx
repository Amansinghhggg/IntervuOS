import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (role === "candidate" || user?.role === "candidate") {
      document.body.classList.add("theme-candidate");
    } else {
      document.body.classList.remove("theme-candidate");
    }
  }, [role, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (!user.role) {
    return <Navigate to="/select-role" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to the correct dashboard based on role
    let redirectPath = "/candidate/dashboard";
    if (user.role === "admin") {
      redirectPath = "/admin";
    } else if (user.role === "employer") {
      redirectPath = "/employer/dashboard";
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
