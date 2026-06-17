import { createContext, useState } from "react";

export const AuthContext = createContext({});
export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  console.log("ESTADO DO LOADING GLOBAL:", loading);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("user");
    try {
      return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch {
      return null;
    }
  });

  const login = (dadosDoUsuario, TokenRecebido) => {
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
      value={{ usuario, token, estaLogado, login, logout, setUsuario, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
