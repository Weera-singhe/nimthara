import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (user.loggedIn === null) return null;

  if (user.loggedIn === false) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
