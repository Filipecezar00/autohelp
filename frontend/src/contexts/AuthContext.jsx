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

  const login = async (dadosDoUsuario, TokenRecebido, email, senha) => {
    const resposta = await api.post("/login", { email, senha });
    const { token, usuario } = resposta.data;

    localStorage.setItem("token", TokenRecebido);
    localStorage.setItem("user", JSON.stringify(dadosDoUsuario));

    setToken(TokenRecebido);
    setUsuario(dadosDoUsuario);
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
