import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../../src/Login.css";
import { RxEyeOpen } from "react-icons/rx";
import { FaRegEyeSlash } from "react-icons/fa";

const validarEmail = (email) => {
  if (!email.trim()) return "Email é obrigatório";
  if (!/\S+@\S+\.\S+/.test(email)) return "Formato de email Inválido";
  return null;
};

const validarSenha = (senha) => {
  if (!senha.trim()) return "Senha é obrigatória";
  if (senha.length < 6) return "A senha é muito curta";
  return null;
};

function Login() {
  const [estaLogado, setEstaLogado] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro(null);
  };

  const alternarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const fazerLogin = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      setCarregando(true);

      const resposta = await api.post("/auth/login", form);

      console.log("CONTEÚDO DA RESPOSTA:", resposta.data);

      if (resposta && resposta.data && resposta.data.token) {
        const token = resposta.data.token;
        localStorage.setItem("token", token);
        navigate("/home");
      } else {
        throw new Error("O servidor não enviou o token de acesso.");
      }
    } catch (error) {
      console.error("DEBUG COMPLETO:", error);

      let msgFinal = "Erro ao conectar com o servidor.";

      if (error.response) {
        msgFinal =
          error.response.data?.message ||
          error.response.data?.mensagem ||
          "Erro no servidor.";
      } else if (error.message) {
        msgFinal = error.menssage;
      }
      setErro(msgFinal);
    } finally {
      setCarregando(false);
    }
  };
  return (
    <div className="tela">
      <div className="card">
        <h1 className="logoTitle">AutoHelp</h1>
        <p className="logoSubtitle">Acesse sua Conta</p>
        {erro && (
          <div className="erroMsg">
            <span>Erro: </span>
            {erro}
          </div>
        )}
        <form onSubmit={fazerLogin} className="login-form">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input"
          />
          <div className="password_space">
            <input
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={form.senha}
              onChange={handleChange}
              className="input"
            />
            <span onClick={alternarSenha} className="password_button">
              {mostrarSenha ? <RxEyeOpen /> : <FaRegEyeSlash />}
            </span>
          </div>
          <button type="submit" className="btnPrimary" disabled={carregando}>
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
