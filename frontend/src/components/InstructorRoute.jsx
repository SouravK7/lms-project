import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function InstructorRoute({ children }) {
  const { user, isAuthenticated, isLoadingProfile } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingProfile) {
    return null;
  }

  if (user?.role !== "instructor") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default InstructorRoute;
