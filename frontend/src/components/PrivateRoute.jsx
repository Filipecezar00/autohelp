import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { estaLogado } = useContext(AuthContext);
  if (estaLogado) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace={true} />;
  }
}
