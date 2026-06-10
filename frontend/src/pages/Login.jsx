import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
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

  const { login } = useContext(AuthContext);

  const fazerLogin = async (e) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/login", form);
      console.log("O QUE VEM DENTRO DE RESP_DATA?:", resposta.data);

      if (!resposta) {
        throw new Error("O servidor não respondeu. verifique sua conexão");
      }

      if (resposta && resposta.data && resposta.data.token) {
        const tokenRecebido = resposta.data.token;
        const dadosDoUsuario = resposta.data.user;

        login(dadosDoUsuario, tokenRecebido);

        if (dadosDoUsuario?.tipo === "prestador") {
          navigate("/painel");
        } else {
          navigate("/mapa");
        }
      } else {
        throw new Error(
          "Usuário autenticado, mas o token não foi enviado pelo servidor",
        );
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
        msgFinal = error.mensage;
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
