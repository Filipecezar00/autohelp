import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "../../src/PainelPrestador.module.css";
import CardSolicitacao from "../components/CardSolicitacao";

export function PainelPrestador() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.tipo !== "prestador") {
      return navigate("/mapa");
    }
  }, [usuario, navigate]);

  useEffect(() => {
    if (usuario?.tipo === "prestador") {
      buscarSolicitacao();
    }
  }, [usuario]);

  async function buscarSolicitacao() {
    try {
      setCarregando(true);
      const resposta = await api.get("/solicitacoes/recebidas");
      setSolicitacoes(resposta.data || []);
    } catch {
      setErro("Erro ao realizar busca de solicações dos clientes");
    } finally {
      setCarregando(false);
    }
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

  if (!usuario || usuario.tipo !== "prestador") return null;
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
              <div className={styles.statusbtns}>
                <CardSolicitacao />
                <button onClick={() => atualizarStatus(id, "aceita")}>
                  Aceitar
                </button>
                <button onClick={() => atualizarStatus(id, "recusada")}>
                  Recusar
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.cardemandamento}>
        <div className={styles.solicitacoesemandamento}>
          {aceitasFiltradas.map((solicitacao) => {
            return (
              <div className={styles.concluir}>
                <CardSolicitacao />
                <button onClick={() => atualizarStatus(id, "concluida")}>
                  Marcar como concluido
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.cardhistorico}>
        <div className={styles.historico}>
          {concluidasFiltradas.map((solicitacao) => {
            return <CardSolicitacao />;
          })}
        </div>
      </div>
    </div>
  );
}
