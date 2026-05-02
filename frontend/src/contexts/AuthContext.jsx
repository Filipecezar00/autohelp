import { createContext, useState } from "react";

export const AuthContext = createContext({});
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(
    localStorage.getItem("usuario") || null,
  );

  const login = (dadosDoUsuario, TokenRecebido) => {
    localStorage.setItem("token", TokenRecebido);
    localStorage.setItem("usuario", JSON.stringify(dadosDoUsuario));

    setToken(TokenRecebido);
    setUsuario(dadosDoUsuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);
  };

  const estaLogado = !!token;
  return (
    <AuthContext.Provider value={{ usuario, token, estaLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
