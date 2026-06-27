import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "../../src/PainelPrestador.module.css";
import { AuthContext } from "../contexts/AuthContext";
import CardSolicitacao from "../components/CardSolicitacao";
import { TbDoorExit } from "react-icons/tb";
import TelaCarregando from "../components/TelaCarregando";

const TIPOS_SERVICO = ["mecanico", "borracheiro", "guincho"];

export function PainelPrestador() {
  const navigate = useNavigate();
  const { usuario, setUsuario, logout } = useContext(AuthContext);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(null);
  const [precisaOnboarding, setPrecisaOnboarding] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState("");

  useEffect(() => {
    if (!usuario) return;

    if (usuario.tipo !== "prestador") {
      navigate("/mapa", { replace: true });
      return;
    }

    if (
      !usuario.tipo_servico ||
      !TIPOS_SERVICO.includes(usuario.tipo_servico)
    ) {
      setPrecisaOnboarding(true);
      setCarregando(false);
      return;
    }

    buscarSolicitacao();
  }, [usuario]);

  async function buscarSolicitacao() {
    try {
      setCarregando(true);
      setErro(null);
      setSolicitacoes([]);

      const resposta = await api.get("/solicitacoes/recebidas");

      setSolicitacoes(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setPrecisaOnboarding(true);
      } else {
        setErro("Erro ao realizar busca de solicações dos clientes");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function finalizarConfiguracaoPerfil() {
    if (!servicoSelecionado) {
      alert("Por favor, selecione a sua especialidade para continuar");
      return;
    }

    if (!navigator.geolocation) {
      alert("Seu dispositivo não suporta geolocalização.");
      return;
    }

    setCarregando(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        await api.put("/prestadores/localizacao", {
          latitude,
          longitude,
          tipo_servico: servicoSelecionado,
        });

        const usuarioAtualizado = {
          ...usuario,
          tipo_servico: servicoSelecionado,
        };

        setUsuario(usuarioAtualizado);

        localStorage.setItem("user", JSON.stringify(usuarioAtualizado));
      } catch {
        alert("Erro ao salvar o perfil. Tente Novamente.");
      } finally {
        setPrecisaOnboarding(false);
        setCarregando(false);
      }
    });
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      if (novoStatus == "recusada") {
        alert("Tem certeza que deseja recusar ?");
      }
      setAtualizando(id);
      await api.patch("/solicitacoes/" + id + "/status", {
        status: novoStatus,
      });
      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: novoStatus } : s)),
      );
    } catch {
      alert("Erro ao Atualizar status");
    } finally {
      setAtualizando(null);
    }
  }

  async function deslogar() {
    const confirmacao = window.confirm("Você tem certeza que quer deslogar ?");
    if (!confirmacao) return;
    logout();
    navigate("/login");
  }

  if (carregando) {
    return <TelaCarregando mensagem={"Carregando..."} />;
  }

  if (erro) {
    return (
      <div className={styles.containerErro}>
        <p>{erro}</p>
        <button onClick={buscarSolicitacao}>Tentar novamente</button>
      </div>
    );
  }

  if (precisaOnboarding) {
    return (
      <div className={styles.containerpaiOnboarding}>
        <div className={styles.containerfilhoOnboarding}>
          <h2 className={styles.tituloOnboarding}>Olá, {usuario?.nome}! </h2>
          <p className={styles.paragrafoOnboarding}>
            Para começar a receber ordens de serviço no mapa, selecione a sua
            especialidade abaixo:{" "}
          </p>
          <select
            className={styles.selectServico}
            value={servicoSelecionado}
            onChange={(e) => setServicoSelecionado(e.target.value)}
          >
            <option value="">Escolha seu serviço</option>
            <option value="mecanico">Mecânico</option>
            <option value="guincho">Guincho</option>
            <option value="borracheiro">Borracheiro</option>
          </select>
          <button
            onClick={finalizarConfiguracaoPerfil}
            className={styles.botaoOnboarding}
          >
            Ativar meu Perfil e Ficar Online
          </button>
        </div>
      </div>
    );
  }

  const pendentesFiltradas =
    solicitacoes?.filter((s) => s.status === "pendente") || [];
  const aceitasFiltradas =
    solicitacoes?.filter((s) => s.status === "aceita") || [];
  const concluidasFiltradas =
    solicitacoes?.filter((s) => s.status === "concluida") || [];

  return (
    <div className={styles.container}>
      <div className={styles.deslogar}>
        <TbDoorExit onClick={deslogar} />
      </div>
      <div className={styles.cabecalho}>
        <h1 className={styles.titulo}>Painel do Prestador</h1>
        <p className={styles.badge}>{pendentesFiltradas.length} pendentes</p>
      </div>
      <div className={styles.cardresposta}>
        <h2>Aguardando Resposta</h2>
        <div className={styles.pendentesfiltradas}>
          {pendentesFiltradas.map((solicitacao) => {
            return (
              <div className={styles.statusbtns} key={solicitacao.id}>
                <CardSolicitacao
                  solicitacao={solicitacao}
                  nomeExibido={solicitacao.cliente_nome}
                />
                <button
                  className={styles.btn_aceitar}
                  disabled={atualizando === solicitacao.id}
                  onClick={() => atualizarStatus(solicitacao.id, "aceita")}
                >
                  {atualizando === solicitacao.id ? "..." : "Aceitar"}
                </button>
                <button
                  className={styles.btn_recusar}
                  onClick={() => atualizarStatus(solicitacao.id, "recusada")}
                  disabled={atualizando === solicitacao.id}
                >
                  Recusar
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.cardemandamento}>
        <h2>Em Andamento</h2>
        <div className={styles.solicitacoesemandamento}>
          {aceitasFiltradas.map((solicitacao) => {
            return (
              <div className={styles.concluir} key={solicitacao.id}>
                <CardSolicitacao solicitacao={solicitacao} />
                <button
                  className={styles.btn_concluir}
                  disabled={atualizando === solicitacao.id}
                  onClick={() => atualizarStatus(solicitacao.id, "concluida")}
                >
                  {atualizando === solicitacao.id
                    ? "..."
                    : "Marcar como concluído"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.cardhistorico}>
        <h2>Histórico</h2>
        <div className={styles.historico}>
          {concluidasFiltradas.map((solicitacao) => {
            return (
              <CardSolicitacao solicitacao={solicitacao} key={solicitacao.id} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
