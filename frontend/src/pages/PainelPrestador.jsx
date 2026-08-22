import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "../../src/PainelPrestador.module.css";
import { AuthContext } from "../contexts/AuthContext";
import CardSolicitacao from "../components/CardSolicitacao";
import { TbDoorExit } from "react-icons/tb";
import TelaCarregando from "../components/TelaCarregando";
import socket from "../services/socket";
import { toast } from "react-toastify";

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
    console.log("1 - useEffect rodou");
    console.log("2 - usuario?.id:", usuario?.id);
    if (!usuario?.id) {
      console.log("sem usuario.id - saindo");
      return;
    }

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

    function aoConectar() {
      console.log("3 - CONNECT disparou - socket.id:", socket.id);
      socket.emit("registrar_usuario", usuario.id);
      console.log("4 - registrar_usuario emitido");
    }
    socket.on("connect", aoConectar);

    socket.on("nova_solicitacao", (novaSolicitacao) => {
      console.log("5 - nova_solicitacao RECEBIDO:", novaSolicitacao);
      setSolicitacoes((listaAnterior) => [novaSolicitacao, ...listaAnterior]);
      toast.success("Você recebeu uma nova solicitação");
    });

    console.log("6 - socket.connected antes do connect():", socket.connected);
    socket.connect();
    console.log("7 - socket.connect() chamado");

    socket.on("solicitacao_expirada", (dadosEvento) => {
      setSolicitacoes((listaAnterior) =>
        listaAnterior.filter((item) => item.id !== dadosEvento.solicitacaoId),
      );
      toast.info("Uma de suas solicitações expirou");
    });

    socket.connect();

    if (socket.connected) {
      console.log("8 - já estava conectado - chamando aoConectar diretamente");
      aoConectar();
    }

    return () => {
      socket.off("connect", aoConectar);
      socket.off("nova_solicitacao");
      socket.off("solicitacao_expirada");
      socket.disconnect();
    };
  }, [usuario?.id]);

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
      toast.info("Por favor, selecione a sua especialidade para continuar");
      return;
    }

    if (!navigator.geolocation) {
      toast.info("Seu dispositivo não suporta geolocalização.");
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
        toast.error("Erro ao salvar o perfil. Tente Novamente.");
      } finally {
        setPrecisaOnboarding(false);
        setCarregando(false);
      }
    });
  }

  async function deletarSolicitacoes(id) {
    try {
      const token = localStorage.getItem("token");
      await api.put("/solicitacoes/" + id + "/esconder", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSolicitacoes((listaAnterior) =>
        listaAnterior.map((item) => item.id != id),
      );
      toast.success("Excluido com sucesso!");
    } catch (error) {
      toast.error("Erro ao Excluir");
      setErro("Não foi possível remover esse item do histórico.");
    }
  }

  async function cancelarSolicitacao(id) {
    const confirm = alert("Você deseja cancelar a solicitação ?");

    if (!confirm) {
      return;
    }
    try {
      await api.patch("/solicitacao/" + id + "/status", {
        status: "cancelada",
      });
      setSolicitacoes((listaAnterior) =>
        listaAnterior.map((item) =>
          item.id === id ? { ...item, status: "cancelada" } : item,
        ),
      );

      toast.success("Solicitação cancelada com sucesso!");
    } catch (error) {
      if (error.response && error.response.status == 422) {
        toast.error("Essa solicitação expirou ou foi cancelada");
      } else {
        toast.error("Não foi possivel cancelar, tente novamente");
      }
    }
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
    } catch (error) {
      if (error.response && error.response.status === 422) {
        toast.error(
          "Ops! O cliente cancelou esta solicitação antes de você aceitar",
        );
        buscarSolicitacao();
      } else {
        toast.error("ocorreu um erro inesperado");
      }
    } finally {
      setAtualizando(null);
    }
  }

  async function aceitarSolicitacao(idSolicitacao) {
    try {
      let resposta = await api.patch(
        "/solicitacoes/" + idSolicitacao + "/aceitar",
      );
      if (resposta.status === 200) {
        setSolicitacoes((listaAtual) => {
          listaAtual.map((item) => {
            if (item.id == idSolicitacao) {
              return { ...item, status: "aceita" };
            } else {
              return item;
            }
          });
        });
        toast.success("Solicitação aceita com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao aceitar Solicitação");
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
                  nomeExibido={solicitacao.nome_cliente}
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
                <CardSolicitacao
                  solicitacao={solicitacao}
                  nomeExibido={solicitacao.nome_cliente}
                />
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
              <CardSolicitacao
                solicitacao={solicitacao}
                key={solicitacao.id}
                nomeExibido={solicitacao.nome_cliente}
                setSolicitacoes={setSolicitacoes}
                onCancelar={() => cancelarSolicitacao(solicitacao.id)}
                onDeletar={() => deletarSolicitacoes(solicitacao.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
