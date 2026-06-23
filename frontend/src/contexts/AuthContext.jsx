import { createContext, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext({});
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("user");
    try {
      return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch {
      return null;
    }
  });

  const login = async (usuario, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));

    setToken(token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUsuario(null);
  };

  const estaLogado = !!token;

  return (
    <AuthContext.Provider
      value={{ usuario, token, estaLogado, login, logout, setUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}
