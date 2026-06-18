import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { loading, usuario } = useContext(AuthContext);

  const usuarioSalvo = localStorage.getItem("user");
  const tokenSalvo = localStorage.getItem("token");

  if (usuarioSalvo && tokenSalvo) {
    return children;
  }

  // console.log("PORTEIRO PRIVATE_ROUTE DISPARADO!", { usuario, loading });

  // if (loading) {
  //   console.log("PRIVATE_ROUTE: Travado no IF do Loading Global!");
  //   return <div>Carregando...</div>;
  // }

  // if (!usuario) {
  //   console.log("PRIVATE ROUTE: Usuário é nulo, chutando para o login");
  // }

  // console.log("PRIVATE_ROUTE: Tudo certo! Liberando a entrado no painel.");

  return <Navigate to="/" />;
}
