import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../../src/Login.css";

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

  const fazerLogin = async (e) => {
    e.preventDefault();

    const erroEmail = validarEmail(form.email);
    const erroSenha = validarSenha(form.senha);
    const erros = erroEmail || erroSenha;

    if (erros) {
      setErro(erros);
      return;
    }

    try {
      setCarregando(true);

      const resposta = await api.post("/auth/login", form);

      const token = resposta.data.token;
      localStorage.setItem("token", token);

      navigate("/home");
    } catch (error) {
      const msg =
        error.response?.status === 401
          ? "Email ou senha incorretos"
          : "Não existe um email vinculado a essa conta.";
      setErro(msg);
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
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={handleChange}
            className="input"
          />
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
