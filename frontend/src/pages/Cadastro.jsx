import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    setErro(null);
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
    <div style={s.tela}>
      <div style={s.card}>
        <div style={s.logoArea}>
          <h1 style={s.logoNome}>AutoHelp</h1>
          <p style={s.logoSub}>Crie sua Conta</p>
        </div>
        {etapa < 4 && (
          <div style={s.progressBar}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  ...s.progressStep,
                  background:
                    i < etapa ? "#2a5298" : i === etapa ? "#3b7de8" : "#1a1d24",
                }}
              ></div>
            ))}
          </div>
        )}

        {erro && (
          <div style={s.erroBadge}>
            <span>Erro: </span>
            {erro}
          </div>
        )}
        {etapa === 1 && (
          <div style={s.form}>
            <div style={s.stepHeader}>
              <h2 style={s.stepTitle}>Quem é você ?</h2>
              <p style={s.stepSub}>Etapa 1 de 3 - informações básicas</p>
            </div>
            <input
              style={s.input}
              placeholder="Nome Completo"
              value={form.nome}
              onChange={handleChange("nome")}
            />
            <input
              style={s.input}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
            />
            <input
              style={s.input}
              type="tel"
              placeholder="Telefone"
              value={form.telefone}
              onChange={handleChange("telefone")}
            />
            <button style={s.btnPrimary} onClick={avancarEtapa}>
              Continuar
            </button>
            <p style={s.hint}>
              Já tem uma conta?{" "}
              <span style={s.link} onClick={() => navigate("/login")}>
                Entrar
              </span>
            </p>
          </div>
        )}
        {etapa === 2 && (
          <div style={s.form}>
            <div style={s.stepHeader}>
              <h2 style={s.stepTitle}>Crie uma senha</h2>
              <p style={s.stepSub}>Etapa 2 de 3 - Segurança da conta</p>
            </div>
            <input
              style={s.input}
              placeholder="Senha"
              type="password"
              value={form.senha}
              onChange={handleChange("senha")}
            />

            {form.senha.length > 0 && (
              <>
                <div style={s.forcaBar}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        ...s.forcaSegmento,
                        background: i <= forca ? forcaCor : "#1a1d24",
                      }}
                    ></div>
                  ))}
                </div>
                <p style={{ ...s.hint, color: forcaCor }}>{forcaLabel}</p>
              </>
            )}
            <input
              style={s.input}
              placeholder="Confirme a senha"
              type="password"
              value={form.confirmarSenha}
              onChange={handleChange("confirmarSenha")}
            />

            <div style={s.btnRow}>
              <button style={s.btnSecondary} onClick={() => setEtapa(1)}>
                Voltar
              </button>
              <button style={s.btnPrimary} onClick={avancarEtapa}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div style={s.form}>
            <div style={s.stepHeader}>
              <h2 style={s.stepTitle}>Como vai usar o app?</h2>
              <p style={s.stepSub}>Etapa 3 de 3 - tipo de conta</p>
            </div>
            <div style={s.tipoGrid}>
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
                  style={{
                    ...s.tipoCard,
                    ...(form.tipo === op.valor ? s.tipoCardSelecionado : {}),
                  }}
                >
                  <span style={{ fontSize: 28 }}>{op.emoji}</span>
                  <p style={s.tipoLabel}>{op.label}</p>
                  <p style={s.tipoDesc}>{op.desc}</p>
                </div>
              ))}
            </div>
            <div style={s.btnRow}>
              <button style={s.btnSecondary} onClick={() => setEtapa(2)}>
                Voltar
              </button>
              <button
                style={{ ...s.btnPrimary, opacity: carregando ? 0.6 : 1 }}
                onClick={handleSubmit}
                disabled={carregando}
              >
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
            </div>
          </div>
        )}
        {etapa === 4 && (
          <div style={s.successArea}>
            <div style={s.successIcon}>Sucess</div>
            <h2 style={s.stepTitle}>Conta criada!</h2>
            <p style={s.stepSub}>Bem vindo ao AutoHelp</p>
            <button style={s.btnPrimary} onClick={() => navigate("/login")}>
              Fazer Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
const s = {
  tela: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#111318",
    padding: "0 24px 40px",
    fontFamily: "sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#111318",
    padding: "40px 24px",
    borderRadius: "24px",
    border: "2px solid #1a1d24",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    marginTop: "4em",
  },
  logoArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 0 20px",
    gap: 6,
  },
  logoIcon: { fontSize: 36 },
  logoNome: { margin: 0, fontSize: 20, fontWeight: 500, color: "#f0f0f0" },
  logoSub: { margin: 0, fontSize: 12, color: "#555e6e" },
  progressBar: { display: "flex", gap: 6, margimBottom: 24, margin: "10px" },
  progressStep: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    transition: "background 0.3s",
  },
  erroBadge: {
    background: "#1f1215",
    border: "1px solid #5a1a22",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "#e05a6a",
    marginBottom: 12,
    width: "100%",
    margin: "10px",
    textAlign: "center",
    fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  stepHeader: { margimBottom: 4 },
  stepTitle: {
    margin: "0 0 4px",
    fontSize: 16,
    fontWeight: 500,
    color: "#e8eaf0",
  },
  stepSub: { margin: 0, fontSize: 12, color: "#555e6e" },
  input: {
    background: "#1a1d24",
    border: "1px solid #252931",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    color: "#e8eaf0",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  forcaBar: { display: "flex", gap: 4, marginTop: -4 },
  forcaSegmento: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    transition: "background 0.3s",
  },
  btnPrimary: {
    background: "#1a4fa8",
    border: "none",
    borderRadius: 12,
    padding: 14,
    color: "#e8f0ff",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    flex: 2,
    width: "100%",
  },
  btnSecondary: {
    background: "#1a1d24",
    border: "1px solid #252931",
    borderRadius: 12,
    padding: 13,
    color: "#7a8494",
    fontSize: 14,
    cursor: "pointer",
    flex: 1,
  },
  btnRow: { display: "flex", gap: 10 },
  tipoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  tipoCard: {
    background: "#1a1d24",
    border: "1px solid #252931",
    margin: "10px",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  tipoCardSelecionado: { background: "#1a2030", border: "1px solid #2a5298" },
  tipoLabel: {
    margin: "8px 0 4px",
    fontSize: 13,
    fontWeight: 500,
    color: "#c8cdd6",
  },
  tipoDesc: { margin: 0, fontSize: 11, color: "#555e6e", lineHeight: 1.4 },
  hint: { textAlign: "center", fontSize: 12, color: "#3a4050", margin: 0 },
  link: { color: "#3b7de8", cursor: "pointer" },
  successArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    paddingTop: 40,
    textAlign: "center",
  },
  successIcon: {
    width: 64,
    height: 64,
    background: "#0d2a1a",
    border: "1px solid #1a4a2a",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    color: "#1d9e75",
  },
};

export default Cadastro;
