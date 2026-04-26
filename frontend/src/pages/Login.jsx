import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../../src/Login.css";

function Login() {
  const [estaLogado, setEstaLogado] = useState(false);
  const [Email, setEmail] = useState("");
  const [Senha, setSenha] = useState("");

  const navigate = useNavigate();

  const fazerLogin = async (email, senha) => {
    try {
      const resposta = await api.post("/auth/login", { email, senha });
      const token = resposta.data.token;

      localStorage.setItem("token", token);
      setEstaLogado(true);

      navigate("/home");
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("EMAIL OU SENHA INCORRETOS");
      } else {
        console.error("ERRO AO CONECTAR. TENTE NOVAMENTE");
      }
    }
  };
  return (
    <div className="tela">
      <div className="card">
        <h1 className="logoTitle">Login AutoHelp</h1>
        <p className="logoSubtitle">Crie sua Conta</p>
        <form onSubmit={fazerLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Senha"
            value={Senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input"
          />
          <button type="submit" className="btnPrimary">
            Entrar
          </button>
          <p className="hint">
            Não tem uma conta ?{" "}
            <span className="link" onClick={() => navigate("/cadastro")}>
              Criar
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
export default Login;
