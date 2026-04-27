import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/Cadastro.css";
import api from "../services/api";
import { RxEyeOpen } from "react-icons/rx";
import { FaRegEyeSlash } from "react-icons/fa";

const validarEtapa1 = ({ nome, email, telefone }) => {
  if (!nome.trim()) return "Nome é obrigatório";
  if (!email.trim()) return "Email é obrigatório";
  if (!/\S+@\S+\.\S+/.test(email)) return "Email inválido";
  return null;
};

const validarEtapa2 = ({ senha, confirmarSenha }) => {
  if (senha.length < 6) return "Senha deve ter pelo menos 6 caracteres";
  if (senha !== confirmarSenha) return "As senhas não coincidem";
  return null;
};

const calcularForcaSenha = (senha) => {
  let pontos = 0;
  if (senha.length >= 6) pontos++;
  if (senha.length >= 10) pontos++;
  if (/[A-Z]/.test(senha)) pontos++;
  if (/[0-9!@#$%]/.test(senha)) pontos++;
  return pontos;
};

function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    tipo: "cliente",
  });

  const [etapa, setEtapa] = useState(1);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setmostrarConfirmarSenha] = useState(false);

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    setErro(null);
  };

  const alternarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const alternarConfirmarSenha = () => {
    setmostrarConfirmarSenha(!mostrarConfirmarSenha);
  };

  const avancarEtapa = () => {
    const erroEtapa1 = etapa === 1 ? validarEtapa1(form) : null;
    const erroEtapa2 = etapa === 2 ? validarEtapa2(form) : null;
    const erroAtual = erroEtapa1 || erroEtapa2;

    if (erroAtual) {
      setErro(erroAtual);
      return;
    }
    setErro(null);
    setEtapa((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      setCarregando(true);
      setErro(null);

      await api.post("/auth/cadastro", {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
        tipo: form.tipo,
      });
      setEtapa(4);
    } catch (error) {
      const mensagem = error.response?.data?.mensagem || "Erro ao criar conta";
      setErro(mensagem);
      setEtapa(3);
    } finally {
      setCarregando(false);
    }
  };

  const forca = calcularForcaSenha(form.senha);
  const forcaLabel = ["", "Fraca", "Regular", "Boa", "Forte"][forca];
  const forcaCor = ["", "#993c1d", "#854f0b", "#185fa5", "#0f6e56"][forca];

  return (
    <div className="tela">
      <div className="card">
        <div className="logoArea">
          <h1 className="logoNome">AutoHelp</h1>
          <p className="LogoSub">Crie sua Conta</p>
        </div>
        {etapa < 4 && (
          <div className="progressBar">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="progressStep"
                style={{
                  background:
                    i < etapa ? "#2a5298" : i === etapa ? "#3b7de8" : "#1a1d24",
                }}
              ></div>
            ))}
          </div>
        )}

        {erro && (
          <div className="erroBadge">
            <span>Erro: </span>
            {erro}
          </div>
        )}
        {etapa === 1 && (
          <div className="form">
            <div className="stepHeader">
              <h2 className="stepTitle">Quem é você ?</h2>
              <p className="stepSub">Etapa 1 de 3 - informações básicas</p>
            </div>
            <input
              className="input"
              placeholder="Nome Completo"
              value={form.nome}
              onChange={handleChange("nome")}
            />
            <input
              className="input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
            />
            <input
              className="input"
              type="tel"
              placeholder="Telefone"
              value={form.telefone}
              onChange={handleChange("telefone")}
            />
            <button className="btnPrimary" onClick={avancarEtapa}>
              Continuar
            </button>
            <p className="hint">
              Já tem uma conta?{" "}
              <span className="link" onClick={() => navigate("/login")}>
                Entrar
              </span>
            </p>
          </div>
        )}
        {etapa === 2 && (
          <div className="form">
            <div className="stepHeader">
              <h2 className="stepTitle">Crie uma senha</h2>
              <p className="stepSub">Etapa 2 de 3 - Segurança da conta</p>
            </div>

            <div className="space_password">
              <div className="input-wrapper">
                <input
                  className="input"
                  placeholder="Senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={form.senha}
                  onChange={handleChange("senha")}
                />
                <span className="button_vison" onClick={alternarSenha}>
                  {mostrarSenha ? <RxEyeOpen /> : <FaRegEyeSlash />}
                </span>
              </div>

              {form.senha.length > 0 && (
                <div className="forca-container">
                  <div className="forcaBar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="forcaSegmento"
                        style={{
                          background: i <= forca ? forcaCor : "#1a1d24",
                        }}
                      ></div>
                    ))}
                  </div>
                  <p style={{ color: forcaCor }} className="hint">
                    {forcaLabel}
                  </p>
                </div>
              )}

              <div className="input-wrapper">
                <input
                  className="input"
                  placeholder="Confirme a senha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  value={form.confirmarSenha}
                  onChange={handleChange("confirmarSenha")}
                />
                <span className="button_vison" onClick={alternarConfirmarSenha}>
                  {mostrarConfirmarSenha ? <RxEyeOpen /> : <FaRegEyeSlash />}
                </span>
              </div>
            </div>

            <div className="btnRow">
              <button className="btnSecondary" onClick={() => setEtapa(1)}>
                Voltar
              </button>
              <button className="btnPrimary" onClick={avancarEtapa}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div className="form">
            <div className="stepHeader">
              <h2 className="stepTitle">Como vai usar o app?</h2>
              <p className="stepSub">Etapa 3 de 3 - tipo de conta</p>
            </div>
            <div className="tipoGrid">
              {[
                {
                  valor: "cliente",
                  label: "Cliente",
                  desc: "Quero encontrar serviços",
                },
                {
                  valor: "prestador",
                  label: "Prestador",
                  desc: "Ofereço Serviços mecânicos",
                },
              ].map((op) => (
                <div
                  key={op.valor}
                  className={`tipoCard${form.tipo === op.valor ? "Selecionado" : ""} ${hovered === op.valor ? "hover" : ""}`}
                  onMouseEnter={() => setHovered(op.valor)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, tipo: op.valor }))
                  }
                >
                  <span style={{ fontSize: 28 }}>{op.emoji}</span>
                  <p className="tipoLabel">{op.label}</p>
                  <p className="tipoDesc">{op.desc}</p>
                </div>
              ))}
            </div>
            <div className="btnRow">
              <button className="btnSecondary" onClick={() => setEtapa(2)}>
                Voltar
              </button>
              <button
                style={{ opacity: carregando ? 0.6 : 1 }}
                className="btnPrimary"
                onClick={handleSubmit}
                disabled={carregando}
              >
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
            </div>
          </div>
        )}
        {etapa === 4 && (
          <div className="successArea">
            <div className="successIcon">Sucess</div>
            <h2 className="stepTitle">Conta criada!</h2>
            <p className="stepSub">Bem vindo ao AutoHelp</p>
            <button className="btnPrimary" onClick={() => navigate("/login")}>
              Fazer Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cadastro;
