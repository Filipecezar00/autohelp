import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "../../src/PainelPrestador.module.css";
import { AuthContext } from "../contexts/AuthContext";
import CardSolicitacao from "../components/CardSolicitacao";

export function PainelPrestador() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(null);

  async function buscarSolicitacao() {
    try {
      setCarregando(true);
      const token = localStorage.getItem("token");

      const resposta = await api.get("/solicitacoes/recebidas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSolicitacoes(resposta.data || []);
    } catch (error) {
      console.error("Erro ao Buscar solicitações:", error);
      setErro("Erro ao realizar busca de solicações dos clientes");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (usuario === undefined) return;

    if (usuario === null) {
      console.log("AGUARDANDO OS DADOS DO USUÁRIO CARREGAREM");
      return;
    }

    if (usuario?.tipo !== "prestador") {
      console.log("Usuário não é prestador! Expulsando para o /mapa...");
      return navigate("/mapa");
    }

    buscarSolicitacao();
  }, [usuario]);

  if (usuario === undefined) {
    return <div className="text-center p-5">Carregando perfil...</div>;
  }

  async function atualizarStatus(id, novoStatus) {
    try {
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

  const pendentesFiltradas = solicitacoes.filter(
    (s) => s.status === "pendente",
  );
  const aceitasFiltradas = solicitacoes.filter((s) => s.status === "aceita");
  const concluidasFiltradas = solicitacoes.filter(
    (s) => s.status === "concluida",
  );

  if (!usuario || usuario.tipo !== "prestador")
    return (
      <p>
        Aguardando o contexto carregar o usuário... (log atual:{" "}
        {String(usuario)})
      </p>
    );
  if (carregando) return <p>Carregando Painel...</p>;
  if (erro) return <p>{erro}</p>;

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
                <CardSolicitacao solicitacao={solicitacao} />
                <button
                  disabled={atualizando === solicitacao.id}
                  onClick={() => atualizarStatus(solicitacao.id, "aceita")}
                >
                  {atualizando === solicitacao.id ? "..." : "Aceitar"}
                </button>
                <button
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
